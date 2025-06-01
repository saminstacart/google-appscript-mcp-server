#!/usr/bin/env node

import { getOAuthAccessToken } from './lib/oauth-helper.js';

async function checkDeployments() {
  const scriptId = '1fSY7y3Rh84FsgJmrFIMm4AUOV3mPgelLRvZ4Dahrv68zyDzX-cGbeYjn';
  
  try {
    console.log('🔐 Getting OAuth token...');
    const token = await getOAuthAccessToken();
    
    console.log('📋 Checking deployments...');
    const deployResponse = await fetch(`https://script.googleapis.com/v1/projects/${scriptId}/deployments`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!deployResponse.ok) {
      const error = await deployResponse.text();
      console.error('❌ Deployments list error:', error);
      return;
    }
    
    const deployments = await deployResponse.json();
    console.log('✅ Deployments:', JSON.stringify(deployments, null, 2));
    
    // For each deployment, get detailed info
    if (deployments.deployments) {
      for (const deployment of deployments.deployments) {
        console.log(`\n📋 Getting details for deployment: ${deployment.deploymentId}`);
        
        const detailResponse = await fetch(`https://script.googleapis.com/v1/projects/${scriptId}/deployments/${deployment.deploymentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (detailResponse.ok) {
          const details = await detailResponse.json();
          console.log('📄 Deployment details:', JSON.stringify(details, null, 2));
          
          // Check if it's a web app and show the URL
          if (details.entryPoints) {
            details.entryPoints.forEach(entry => {
              if (entry.entryPointType === 'WEB_APP') {
                console.log(`🌐 Web App URL: ${entry.webApp.url}`);
              }
            });
          }
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkDeployments();
