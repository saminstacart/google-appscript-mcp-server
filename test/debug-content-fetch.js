#!/usr/bin/env node

/**
 * Debug script to test the get-content function directly
 */

import { getOAuthAccessToken } from '../lib/oauth-helper.js';

async function testGetContent() {
  const scriptId = '1fSY7y3Rh84FsgJmrFIMm4AUOV3mPgelLRvZ4Dahrv68zyDzX-cGbeYjn';
  
  try {
    console.log('🔐 Getting OAuth access token...');
    const token = await getOAuthAccessToken();
    console.log('✅ Got access token:', token.substring(0, 20) + '...');
    
    console.log('🌐 Making API request to get script content...');
    const url = `https://script.googleapis.com/v1/projects/${scriptId}/content`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      
      // Try to parse as JSON for more details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('❌ Parsed error:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.error('❌ Raw error text:', errorText);
      }
      
      return;
    }
    
    const data = await response.json();
    console.log('✅ Success! Script content:');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testGetContent();
