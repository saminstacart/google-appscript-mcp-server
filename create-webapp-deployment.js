#!/usr/bin/env node

import { getOAuthAccessToken } from './lib/oauth-helper.js';

async function createVersionAndDeploy() {
  const scriptId = '1fSY7y3Rh84FsgJmrFIMm4AUOV3mPgelLRvZ4Dahrv68zyDzX-cGbeYjn';
  
  try {
    console.log('🔐 Getting OAuth token...');
    const token = await getOAuthAccessToken();
    
    console.log('📋 Creating version...');
    const versionResponse = await fetch(`https://script.googleapis.com/v1/projects/${scriptId}/versions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        description: 'Version for web app deployment' 
      })
    });
    
    if (!versionResponse.ok) {
      const error = await versionResponse.text();
      console.error('❌ Version creation error:', error);
      return;
    }
    
    const version = await versionResponse.json();
    console.log('✅ Version created:', JSON.stringify(version, null, 2));
      console.log('🚀 Creating deployment...');
    const deployResponse = await fetch(`https://script.googleapis.com/v1/projects/${scriptId}/deployments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        versionNumber: version.versionNumber,
        description: 'Web app accessible by anyone',
        manifestFileName: 'appsscript'
      })
    });
    
    if (!deployResponse.ok) {
      const error = await deployResponse.text();
      console.error('❌ Deployment creation error:', error);
      return;
    }
    
    const deployment = await deployResponse.json();
    console.log('✅ Deployment created:', JSON.stringify(deployment, null, 2));
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

createVersionAndDeploy();
