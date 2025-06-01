#!/usr/bin/env node

/**
 * Debug script to test deployment-related API calls
 */

import { getOAuthAccessToken } from '../lib/oauth-helper.js';

async function testDeploymentApis() {
  const scriptId = '1fSY7y3Rh84FsgJmrFIMm4AUOV3mPgelLRvZ4Dahrv68zyDzX-cGbeYjn';
  
  try {
    console.log('🔐 Getting OAuth access token...');
    const token = await getOAuthAccessToken();
    console.log('✅ Got access token');
    
    // Test versions list
    console.log('\n📋 Testing versions list...');
    let url = `https://script.googleapis.com/v1/projects/${scriptId}/versions`;
    
    let response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📡 Versions response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Versions API Error:', errorText);
    } else {
      const data = await response.json();
      console.log('✅ Versions data:', JSON.stringify(data, null, 2));
    }
    
    // Test deployments list
    console.log('\n📋 Testing deployments list...');
    url = `https://script.googleapis.com/v1/projects/${scriptId}/deployments`;
    
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📡 Deployments response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Deployments API Error:', errorText);
    } else {
      const data = await response.json();
      console.log('✅ Deployments data:', JSON.stringify(data, null, 2));
    }
    
    // Test creating a version
    console.log('\n📋 Testing version creation...');
    url = `https://script.googleapis.com/v1/projects/${scriptId}/versions`;
    
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'Version for web app deployment'
      })
    });
    
    console.log('📡 Version creation response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Version creation API Error:', errorText);
    } else {
      const data = await response.json();
      console.log('✅ Version creation data:', JSON.stringify(data, null, 2));
      
      // If version was created successfully, try to create a deployment
      if (data.versionNumber) {
        console.log('\n📋 Testing deployment creation...');
        url = `https://script.googleapis.com/v1/projects/${scriptId}/deployments`;
        
        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            versionNumber: data.versionNumber,
            description: 'Web app deployment - accessible by anyone',
            manifestFileName: 'appsscript',
            deploymentConfig: {
              scriptId: scriptId,
              description: 'Web app deployment - accessible by anyone',
              manifestFileName: 'appsscript',
              versionNumber: data.versionNumber
            }
          })
        });
        
        console.log('📡 Deployment creation response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Deployment creation API Error:', errorText);
        } else {
          const deploymentData = await response.json();
          console.log('✅ Deployment creation data:', JSON.stringify(deploymentData, null, 2));
        }
      }
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

testDeploymentApis();
