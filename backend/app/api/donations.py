"""
donations.py — Donation API endpoints (async SQLAlchemy).
"""
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import (
    Donation,
    Transaction,
    User,
    DonationStatus,
    PaymentProvider,
    TransactionStatus,
    DonationCause,
)
from app.schemas import (
    DonationCreate,
    DonationResponse,
    DonationUpdate,
    PaymentMethodResponse,
    TransactionResponse,
    PaymentInitiateRequest,
    PaymentInitiateResponse,
)
from app.utils import get_current_user

router = APIRouter(prefix="/donations", tags=["donations"])


# ── Payment Methods ────────────────────────────────────────────────────────────
@router.get("/payment-methods", response_model=List[PaymentMethodResponse])
async def get_payment_methods(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PaymentMethod).where(PaymentMethod.is_active == True)
    )
    return result.scalars().all()


# ── Create Donation ────────────────────────────────────────────────────────────
@router.post("", response_model=DonationResponse, status_code=status.HTTP_201_CREATED)
async def create_donation(
    donation_data: DonationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate payment provider is a known enum value
    valid_providers = {p.value for p in PaymentProvider}
    if str(donation_data.payment_provider) not in valid_providers and donation_data.payment_provider not in valid_providers:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid payment provider. Must be one of: {', '.join(valid_providers)}",
        )

    # Hard-coded limits per provider (no DB lookup required)
    PROVIDER_LIMITS = {
        PaymentProvider.BKASH: (10, 25000),
        PaymentProvider.NAGAD: (10, 25000),
        PaymentProvider.BANK:  (50, 100000),
    }
    min_amt, max_amt = PROVIDER_LIMITS.get(donation_data.payment_provider, (10, 100000))

    if donation_data.amount < min_amt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum donation amount for this payment method is ৳{min_amt}",
        )
    if donation_data.amount > max_amt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum donation amount for this payment method is ৳{max_amt}",
        )

    receipt_number = f"DN{datetime.now().strftime('%Y%m%d')}{str(uuid.uuid4())[:8].upper()}"

    donation = Donation(
        user_id=current_user.id,
        amount=donation_data.amount,
        currency="BDT",
        cause=donation_data.cause,
        donor_name=donation_data.donor_name,
        donor_email=donation_data.donor_email,
        donor_phone=donation_data.donor_phone,
        message=donation_data.message,
        payment_provider=donation_data.payment_provider,
        status=DonationStatus.PENDING,
        receipt_number=receipt_number,
        is_anonymous=donation_data.is_anonymous or False,
    )

    db.add(donation)
    await db.flush()  # get donation.id

    transaction = Transaction(
        donation_id=donation.id,
        amount=donation_data.amount,
        currency="BDT",
        provider=donation_data.payment_provider,
        status=TransactionStatus.INITIATED,
    )

    db.add(transaction)
    await db.commit()
    await db.refresh(donation)
    return donation


# ── List User Donations ────────────────────────────────────────────────────────
@router.get("", response_model=List[DonationResponse])
async def get_user_donations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 20,
    status_filter: Optional[DonationStatus] = None,
    cause_filter: Optional[DonationCause] = None,
):
    query = select(Donation).where(Donation.user_id == current_user.id)

    if status_filter:
        query = query.where(Donation.status == status_filter)
    if cause_filter:
        query = query.where(Donation.cause == cause_filter)

    query = query.order_by(Donation.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


# ── Admin: all donations ───────────────────────────────────────────────────────
@router.get("/admin/all", response_model=List[DonationResponse])
async def get_all_donations_admin(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    result = await db.execute(
        select(Donation).order_by(Donation.created_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()


# ── Admin: analytics ───────────────────────────────────────────────────────────
@router.get("/admin/analytics")
async def get_donation_analytics(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    days: int = 30,
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    cutoff = datetime.utcnow() - timedelta(days=days)
    result = await db.execute(select(Donation).where(Donation.created_at >= cutoff))
    all_donations = result.scalars().all()

    completed = [d for d in all_donations if d.status == DonationStatus.COMPLETED]
    total_amount = sum(float(d.amount) for d in completed)
    total_count = len(all_donations)
    completed_count = len(completed)

    by_cause: dict = {}
    for d in completed:
        k = str(d.cause)
        if k not in by_cause:
            by_cause[k] = {"count": 0, "amount": 0.0}
        by_cause[k]["count"] += 1
        by_cause[k]["amount"] += float(d.amount)

    by_provider: dict = {}
    for d in all_donations:
        k = str(d.payment_provider)
        if k not in by_provider:
            by_provider[k] = {"count": 0, "amount": 0.0}
        by_provider[k]["count"] += 1
        if d.status == DonationStatus.COMPLETED:
            by_provider[k]["amount"] += float(d.amount)

    by_status: dict = {}
    for d in all_donations:
        k = str(d.status)
        by_status[k] = by_status.get(k, 0) + 1

    return {
        "period_days": days,
        "total_donations": total_count,
        "completed_donations": completed_count,
        "total_amount": total_amount,
        "average_amount": round(total_amount / completed_count, 2) if completed_count else 0,
        "success_rate": round(completed_count / total_count * 100, 1) if total_count else 0,
        "by_cause": by_cause,
        "by_provider": by_provider,
        "by_status": by_status,
    }


# ── Get Donation ───────────────────────────────────────────────────────────────
@router.get("/{donation_id}", response_model=DonationResponse)
async def get_donation(
    donation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Donation).where(
            and_(Donation.id == donation_id, Donation.user_id == current_user.id)
        )
    )
    donation = result.scalar_one_or_none()
    if not donation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation not found")
    return donation


# ── Initiate Payment ───────────────────────────────────────────────────────────
@router.post("/{donation_id}/initiate-payment", response_model=PaymentInitiateResponse)
async def initiate_payment(
    donation_id: str,
    payment_data: PaymentInitiateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Donation).where(
            and_(
                Donation.id == donation_id,
                Donation.user_id == current_user.id,
                Donation.status == DonationStatus.PENDING,
            )
        )
    )
    donation = result.scalar_one_or_none()
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation not found or already processed",
        )

    tx_result = await db.execute(
        select(Transaction)
        .where(Transaction.donation_id == donation_id)
        .order_by(Transaction.created_at.desc())
    )
    transaction = tx_result.scalars().first()
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No transaction found for this donation",
        )

    donation.status = DonationStatus.PROCESSING
    transaction.status = TransactionStatus.PENDING

    provider_response: dict = {}
    payment_url = ""
    provider_transaction_id = ""

    if donation.payment_provider == PaymentProvider.BKASH:
        provider_transaction_id = f"BK{datetime.now().strftime('%Y%m%d%H%M%S')}{str(uuid.uuid4())[:6].upper()}"
        payment_url = f"https://checkout.pay.bka.sh/v1.2.0-beta/checkout/payment/{provider_transaction_id}"
        provider_response = {
            "paymentID": provider_transaction_id,
            "bkashURL": payment_url,
        }

    elif donation.payment_provider == PaymentProvider.NAGAD:
        provider_transaction_id = f"NG{datetime.now().strftime('%Y%m%d%H%M%S')}{str(uuid.uuid4())[:6].upper()}"
        payment_url = f"https://api.mynagad.com/api/dfs/check-out/initialize/{provider_transaction_id}"
        provider_response = {
            "paymentReferenceId": provider_transaction_id,
            "checkoutURL": payment_url,
        }

    elif donation.payment_provider == PaymentProvider.BANK:
        provider_transaction_id = f"BT{datetime.now().strftime('%Y%m%d%H%M%S')}{str(uuid.uuid4())[:6].upper()}"
        provider_response = {
            "referenceNumber": provider_transaction_id,
            "bankDetails": {
                "accountName": "ShebaBD Foundation",
                "accountNumber": "1234567890",
                "bankName": "Dutch Bangla Bank Limited",
                "branchName": "Dhanmondi Branch",
                "routingNumber": "090260323",
            },
            "instructions": [
                "Transfer the exact amount to the provided bank account",
                f"Use reference number: {provider_transaction_id}",
                "Keep the transaction receipt for verification",
            ],
        }

    transaction.provider_transaction_id = provider_transaction_id
    transaction.provider_response = provider_response

    await db.commit()

    return PaymentInitiateResponse(
        donation_id=donation_id,
        transaction_id=transaction.id,
        provider=donation.payment_provider,
        provider_transaction_id=provider_transaction_id,
        payment_url=payment_url,
        provider_response=provider_response,
        amount=float(donation.amount),
        currency=donation.currency,
        expires_at=datetime.now().timestamp() + 1800,
    )


# ── Verify Payment ─────────────────────────────────────────────────────────────
@router.put("/{donation_id}/verify", response_model=DonationResponse)
async def verify_payment(
    donation_id: str,
    verification_data: DonationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Donation).where(
            and_(Donation.id == donation_id, Donation.user_id == current_user.id)
        )
    )
    donation = result.scalar_one_or_none()
    if not donation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation not found")

    tx_result = await db.execute(
        select(Transaction)
        .where(Transaction.donation_id == donation_id)
        .order_by(Transaction.created_at.desc())
    )
    transaction = tx_result.scalars().first()

    if verification_data.status == DonationStatus.COMPLETED:
        donation.status = DonationStatus.COMPLETED
        if transaction:
            transaction.status = TransactionStatus.SUCCESS
            transaction.completed_at = datetime.now()
            if transaction.provider_response:
                transaction.provider_response = {
                    **transaction.provider_response,
                    "verificationStatus": "SUCCESS",
                    "verifiedAt": datetime.now().isoformat(),
                    "transactionHash": f"TXN{str(uuid.uuid4())[:12].upper()}",
                }
    elif verification_data.status == DonationStatus.FAILED:
        donation.status = DonationStatus.FAILED
        if transaction:
            transaction.status = TransactionStatus.FAILED
            transaction.error_message = verification_data.error_message or "Payment verification failed"
    elif verification_data.status == DonationStatus.CANCELLED:
        donation.status = DonationStatus.CANCELLED
        if transaction:
            transaction.status = TransactionStatus.CANCELLED

    await db.commit()
    await db.refresh(donation)
    return donation


# ── Donation Transactions ──────────────────────────────────────────────────────
@router.get("/{donation_id}/transactions", response_model=List[TransactionResponse])
async def get_donation_transactions(
    donation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # verify ownership
    result = await db.execute(
        select(Donation).where(
            and_(Donation.id == donation_id, Donation.user_id == current_user.id)
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation not found")

    tx_result = await db.execute(
        select(Transaction)
        .where(Transaction.donation_id == donation_id)
        .order_by(Transaction.created_at.desc())
    )
    return tx_result.scalars().all()


# ── Tracking: Status ───────────────────────────────────────────────────────────
@router.get("/{donation_id}/status")
async def get_donation_status(
    donation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Donation).where(
            and_(Donation.id == donation_id, Donation.user_id == current_user.id)
        )
    )
    donation = result.scalar_one_or_none()
    if not donation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation not found")

    tx_result = await db.execute(
        select(Transaction)
        .where(Transaction.donation_id == donation_id)
        .order_by(Transaction.created_at.desc())
    )
    latest_tx = tx_result.scalars().first()

    return {
        "donation_id": donation.id,
        "status": donation.status,
        "amount": float(donation.amount),
        "payment_provider": donation.payment_provider,
        "receipt_number": donation.receipt_number,
        "created_at": donation.created_at.isoformat() if donation.created_at else None,
        "updated_at": donation.updated_at.isoformat() if donation.updated_at else None,
        "latest_transaction": {
            "id": latest_tx.id,
            "status": latest_tx.status,
            "provider_transaction_id": latest_tx.provider_transaction_id,
            "error_message": latest_tx.error_message,
            "created_at": latest_tx.created_at.isoformat() if latest_tx.created_at else None,
        } if latest_tx else None,
    }


# ── Tracking: Timeline ─────────────────────────────────────────────────────────
@router.get("/{donation_id}/timeline")
async def get_donation_timeline(
    donation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Donation).where(
            and_(Donation.id == donation_id, Donation.user_id == current_user.id)
        )
    )
    donation = result.scalar_one_or_none()
    if not donation:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Donation not found")

    tx_result = await db.execute(
        select(Transaction)
        .where(Transaction.donation_id == donation_id)
        .order_by(Transaction.created_at.asc())
    )
    transactions = tx_result.scalars().all()

    timeline = [
        {
            "id": f"created_{donation.id}",
            "type": "created",
            "status": "pending",
            "title": "Donation Initiated",
            "description": f"Donation of ৳{donation.amount} initiated for {donation.cause}",
            "timestamp": donation.created_at.isoformat() if donation.created_at else None,
            "details": {
                "amount": float(donation.amount),
                "cause": str(donation.cause),
                "payment_provider": str(donation.payment_provider),
            },
        }
    ]

    for tx in transactions:
        timeline.append({
            "id": tx.id,
            "type": "transaction",
            "status": str(tx.status),
            "title": f"Payment {str(tx.status).replace('_', ' ').title()}",
            "description": f"Transaction {tx.provider_transaction_id or tx.id}",
            "timestamp": tx.created_at.isoformat() if tx.created_at else None,
            "details": tx.provider_response or {},
        })

    return {
        "donation_id": donation.id,
        "current_status": donation.status,
        "timeline": timeline,
    }
 
   