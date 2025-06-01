#!/usr/bin/env node

import { getOAuthAccessToken } from '../lib/oauth-helper.js';

async function updateDeploymentForWebApp() {
  const scriptId = '1fSY7y3Rh84FsgJmrFIMm4AUOV3mPgelLRvZ4Dahrv68zyDzX-cGbeYjn';
  const deploymentId = 'AKfycbx58SZUlVdfZdlUsfYiJnj94oBrpb_yH7IpbSqu7bhDs8sawIgIXaw40c1NLooxNb2e';
  
  try {
    console.log('🔐 Getting OAuth token...');
    const token = await getOAuthAccessToken();
    
    console.log('🚀 Updating deployment for web app...');
    const updateResponse = await fetch(`https://script.googleapis.com/v1/projects/${scriptId}/deployments/${deploymentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        deploymentConfig: {
          scriptId: scriptId,
          versionNumber: 4,
          manifestFileName: 'appsscript',
          description: 'Web app accessible by anyone',
          access: 'ANYONE',
          executeAs: 'USER_DEPLOYING'
        }
      })
    });
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.error('❌ Update deployment error:', error);
      return;
    }
    
    const updatedDeployment = await updateResponse.json();
    console.log('✅ Updated deployment:', JSON.stringify(updatedDeployment, null, 2));
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

updateDeploymentForWebApp();
