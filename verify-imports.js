// Simple verification that key files exist and have expected imports
import fs from 'fs';
import path from 'path';

const checkFile = (filePath, requiredImports = []) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(`✓ ${filePath} exists`);
    
    requiredImports.forEach(importStr => {
      if (content.includes(importStr)) {
        console.log(`  ✓ Has: ${importStr}`);
      } else {
        console.log(`  ✗ Missing: ${importStr}`);
      }
    });
    
    return true;
  } catch (err) {
    console.log(`✗ ${filePath} - ${err.message}`);
    return false;
  }
};

console.log('=== Verifying Key Auth Files ===\n');

// Check auth context
checkFile('src/context/AuthContext.tsx', [
  'export type AuthUser',
  'export type UpdateProfilePayload', 
  'export type ChangePasswordPayload',
  'export type AuthContextValue'
]);

// Check auth provider
checkFile('src/context/AuthProvider.tsx', [
  'import { AuthContext',
  'from \'./AuthContext\'',
  'updateProfile:',
  'changePassword:'
]);

// Check auth API
checkFile('src/services/authApi.ts', [
  'updateProfile:',
  'changePassword:',
  'from \'@/context/AuthContext\''
]);

// Check profile page
checkFile('src/pages/Profile.tsx', [
  'import type { UpdateProfilePayload, ChangePasswordPayload }',
  'from \'@/context/AuthContext\''
]);

// Check protected route
checkFile('src/components/auth/ProtectedRoute.tsx', [
  'useAuth',
  'Navigate'
]);

// Check routes
checkFile('src/routes/index.tsx', [
  'ProtectedRoute',
  'ROUTES.PROFILE'
]);

console.log('\n=== Environment Files ===\n');

checkFile('.env', [
  'VITE_API_BASE_URL=http://localhost:8000/api/v1',
  'VITE_BACKEND_URL=http://localhost:8000'
]);

checkFile('.env.example', [
  'VITE_API_BASE_URL',
  'VITE_BACKEND_URL'
]);

console.log('\n=== Verification Complete ===');