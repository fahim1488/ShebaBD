"""
community.py — Community API endpoints.

Routes
------
GET  /community/stats              — aggregate stats
GET  /community/blogs              — list blog posts
GET  /community/blogs/{id}         — single blog post
POST /community/blogs              — create (admin)
POST /community/blogs/{id}/like    — toggle like

GET  /community/stories            — list volunteer stories
POST /community/stories            — submit your story
POST /community/stories/{id}/like  — toggle like

GET  /community/forum              — list threads (pinned first)
POST /community/forum              — create new thread
GET  /community/forum/{id}         — thread + replies
POST /community/forum/{id}/replies — reply to thread
POST /community/forum/{id}/like    — toggle like on thread

GET  /community/announcements      — list active announcements
"""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import (
    BlogPost, VolunteerStory, ForumThread, ForumReply,
    Announcement, PostLike, User,
)
from app.schemas import (
    BlogPostResponse, BlogPostCreate,
    VolunteerStoryResponse, VolunteerStoryCreate,
    ForumThreadResponse, ForumThreadCreate,
    ForumReplyResponse, ForumReplyCreate,
    AnnouncementResponse, CommunityStatsResponse, LikeResponse,
)
from app.utils import get_current_user, get_current_user_optional

router = APIRouter(prefix="/community", tags=["community"])


# ── Stats ──────────────────────────────────────────────────────────────────────
@router.get("/stats", response_model=CommunityStatsResponse)
async def get_community_stats(db: AsyncSession = Depends(get_db)):
    blog_count = (await db.execute(select(func.count(BlogPost.id)).where(BlogPost.is_published == True))).scalar_one()
    story_count = (await db.execute(select(func.count(VolunteerStory.id)).where(VolunteerStory.is_approved == True))).scalar_one()
    thread_count = (await db.execute(select(func.count(ForumThread.id)))).scalar_one()
    reply_count = (await db.execute(select(func.count(ForumReply.id)))).scalar_one()
    member_count = (await db.execute(select(func.count(User.id)))).scalar_one()
    return CommunityStatsResponse(
        blog_count=blog_count,
        story_count=story_count,
        forum_post_count=thread_count + reply_count,
        member_count=member_count,
    )


# ── Blogs ──────────────────────────────────────────────────────────────────────
@router.get("/blogs", response_model=List[BlogPostResponse])
async def list_blogs(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    category: Optional[str] = None,
):
    q = select(BlogPost).where(BlogPost.is_published == True)
    if category:
        q = q.where(BlogPost.category == category)
    q = q.order_by(BlogPost.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.get("/blogs/{blog_id}", response_model=BlogPostResponse)
async def get_blog(blog_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BlogPost).where(BlogPost.id == blog_id, BlogPost.is_published == True))
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return blog


@router.post("/blogs", response_model=BlogPostResponse, status_code=201)
async def create_blog(
    data: BlogPostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    colors = ["#3E7A8C", "#D6472C", "#E7A93B", "#4C8C6B"]
    import random
    blog = BlogPost(
        title=data.title,
        excerpt=data.excerpt,
        content=data.content,
        category=data.category,
        author_name=current_user.name,
        author_role="ShebaBD Team",
        author_user_id=current_user.id,
        image_initials=(data.title[:2].upper()),
        color_hex=random.choice(colors),
        read_time=data.read_time or "5 min read",
    )
    db.add(blog)
    await db.commit()
    await db.refresh(blog)
    return blog


@router.post("/blogs/{blog_id}/like", response_model=LikeResponse)
async def toggle_blog_like(
    blog_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    blog_result = await db.execute(select(BlogPost).where(BlogPost.id == blog_id))
    blog = blog_result.scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")

    like_result = await db.execute(
        select(PostLike).where(and_(PostLike.user_id == current_user.id, PostLike.blog_post_id == blog_id))
    )
    existing = like_result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        blog.likes_count = max(0, blog.likes_count - 1)
        liked = False
    else:
        db.add(PostLike(user_id=current_user.id, blog_post_id=blog_id))
        blog.likes_count += 1
        liked = True

    await db.commit()
    return LikeResponse(liked=liked, likes_count=blog.likes_count)


# ── Volunteer Stories ─────────────────────────────────────────────────────────
@router.get("/stories", response_model=List[VolunteerStoryResponse])
async def list_stories(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
):
    result = await db.execute(
        select(VolunteerStory).where(VolunteerStory.is_approved == True)
        .order_by(VolunteerStory.created_at.desc()).offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.post("/stories", response_model=VolunteerStoryResponse, status_code=201)
async def submit_story(
    data: VolunteerStoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    colors = ["#D6472C", "#E7A93B", "#3E7A8C", "#4C8C6B"]
    import random
    initials = "".join(w[0].upper() for w in data.name.split()[:2]) or "VS"
    story = VolunteerStory(
        name=data.name,
        role=data.role,
        avatar_initials=initials,
        color_hex=random.choice(colors),
        story=data.story,
        cause=data.cause,
        blood_donations=data.blood_donations or 0,
        volunteer_hours=data.volunteer_hours or 0,
        author_user_id=current_user.id,
        is_approved=True,
    )
    db.add(story)
    await db.commit()
    await db.refresh(story)
    return story


@router.post("/stories/{story_id}/like", response_model=LikeResponse)
async def toggle_story_like(
    story_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    story_result = await db.execute(select(VolunteerStory).where(VolunteerStory.id == story_id))
    story = story_result.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")

    like_result = await db.execute(
        select(PostLike).where(and_(PostLike.user_id == current_user.id, PostLike.story_id == story_id))
    )
    existing = like_result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        story.likes_count = max(0, story.likes_count - 1)
        liked = False
    else:
        db.add(PostLike(user_id=current_user.id, story_id=story_id))
        story.likes_count += 1
        liked = True

    await db.commit()
    return LikeResponse(liked=liked, likes_count=story.likes_count)


# ── Forum ──────────────────────────────────────────────────────────────────────
@router.get("/forum", response_model=List[ForumThreadResponse])
async def list_threads(
    db: AsyncSession = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50),
    category: Optional[str] = None,
):
    q = select(ForumThread)
    if category:
        q = q.where(ForumThread.category == category)
    # pinned first, then newest
    q = q.order_by(ForumThread.is_pinned.desc(), ForumThread.updated_at.desc()).offset(skip).limit(limit)
    result = await db.execute(q)
    threads = result.scalars().all()
    
    # Convert to response format without trying to access replies
    response_threads = []
    for thread in threads:
        response_threads.append(ForumThreadResponse(
            id=thread.id,
            title=thread.title,
            body=thread.body,
            category=thread.category,
            author_name=thread.author_name,
            color_hex=thread.color_hex,
            is_pinned=thread.is_pinned,
            is_locked=thread.is_locked,
            likes_count=thread.likes_count,
            replies_count=thread.replies_count,
            created_at=thread.created_at,
            updated_at=thread.updated_at,
            replies=[]  # Empty for list endpoint, populated only in get_thread
        ))
    
    return response_threads


@router.post("/forum", response_model=ForumThreadResponse, status_code=201)
async def create_thread(
    data: ForumThreadCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    colors = {"NGOs": "#3E7A8C", "Emergency": "#D6472C", "Volunteers": "#E7A93B",
              "Technology": "#4C8C6B", "Donations": "#E7A93B", "Stories": "#3E7A8C"}
    thread = ForumThread(
        title=data.title,
        body=data.body,
        category=data.category,
        author_name=current_user.name,
        author_user_id=current_user.id,
        color_hex=colors.get(data.category, "#3E7A8C"),
    )
    db.add(thread)
    await db.commit()
    await db.refresh(thread)
    return thread


@router.get("/forum/{thread_id}", response_model=ForumThreadResponse)
async def get_thread(thread_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ForumThread).where(ForumThread.id == thread_id))
    thread = result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    # load replies
    replies_result = await db.execute(
        select(ForumReply).where(ForumReply.thread_id == thread_id).order_by(ForumReply.created_at.asc())
    )
    thread.replies = replies_result.scalars().all()
    return thread


@router.post("/forum/{thread_id}/replies", response_model=ForumReplyResponse, status_code=201)
async def add_reply(
    thread_id: int,
    data: ForumReplyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    thread_result = await db.execute(select(ForumThread).where(ForumThread.id == thread_id))
    thread = thread_result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    if thread.is_locked:
        raise HTTPException(status_code=400, detail="Thread is locked")

    reply = ForumReply(
        thread_id=thread_id,
        body=data.body,
        author_name=current_user.name,
        author_user_id=current_user.id,
    )
    db.add(reply)
    thread.replies_count += 1
    thread.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(reply)
    return reply


@router.post("/forum/{thread_id}/like", response_model=LikeResponse)
async def toggle_thread_like(
    thread_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    thread_result = await db.execute(select(ForumThread).where(ForumThread.id == thread_id))
    thread = thread_result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    like_result = await db.execute(
        select(PostLike).where(and_(PostLike.user_id == current_user.id, PostLike.thread_id == thread_id))
    )
    existing = like_result.scalar_one_or_none()

    if existing:
        await db.delete(existing)
        thread.likes_count = max(0, thread.likes_count - 1)
        liked = False
    else:
        db.add(PostLike(user_id=current_user.id, thread_id=thread_id))
        thread.likes_count += 1
        liked = True

    await db.commit()
    return LikeResponse(liked=liked, likes_count=thread.likes_count)


# ── Announcements ──────────────────────────────────────────────────────────────
@router.get("/announcements", response_model=List[AnnouncementResponse])
async def list_announcements(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Announcement).where(Announcement.is_active == True)
        .order_by(Announcement.created_at.desc()).limit(10)
    )
    return result.scalars().all()


# ── Delete Endpoints ────────────────────────────────────────────────────────────
@router.delete("/blogs/{blog_id}", status_code=204)
async def delete_blog(
    blog_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(BlogPost).where(BlogPost.id == blog_id))
    blog = result.scalar_one_or_none()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog post not found")
    await db.delete(blog)
    await db.commit()


@router.delete("/stories/{story_id}", status_code=204)
async def delete_story(
    story_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(VolunteerStory).where(VolunteerStory.id == story_id))
    story = result.scalar_one_or_none()
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    await db.delete(story)
    await db.commit()


@router.delete("/forum/{thread_id}", status_code=204)
async def delete_thread(
    thread_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ForumThread).where(ForumThread.id == thread_id))
    thread = result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    await db.delete(thread)
    await db.commit()

