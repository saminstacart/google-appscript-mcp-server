import { getOAuthAccessToken } from '../../../lib/oauth-helper.js';
import { logger } from '../../../lib/logger.js';

/**
 * Function to get a deployment of an Apps Script project.
 *
 * @param {Object} args - Arguments for the deployment retrieval.
 * @param {string} args.scriptId - The ID of the script project.
 * @param {string} args.deploymentId - The ID of the deployment to retrieve.
 * @returns {Promise<Object>} - The result of the deployment retrieval.
 */
const executeFunction = async ({ scriptId, deploymentId }) => {
  const baseUrl = 'https://script.googleapis.com';
  const url = `${baseUrl}/v1/projects/${scriptId}/deployments/${deploymentId}`;

  try {
    // Get OAuth access token
    const token = await getOAuthAccessToken();
    
    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'GET',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Parse and return the response data
    const data = await response.json();
    return data;
  } catch (error) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      scriptId,
      deploymentId,
      timestamp: new Date().toISOString(),
      errorType: error.name || 'Unknown'
    };

    logger.error('DEPLOYMENT_GET', 'Error retrieving deployment', errorDetails);
    
    console.error('❌ Error retrieving deployment:', errorDetails);
    
    // Return detailed error information for debugging
    return { 
      error: true,
      message: error.message,
      details: errorDetails,
      rawError: {
        name: error.name,
        stack: error.stack
      }
    };
  }
};

/**
 * Tool configuration for getting a deployment of an Apps Script project.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'script_projects_deployments_get',
      description: 'Get a deployment of an Apps Script project.',
      parameters: {
        type: 'object',
        properties: {
          scriptId: {
            type: 'string',
            description: 'The ID of the script project.'
          },
          deploymentId: {
            type: 'string',
            description: 'The ID of the deployment to retrieve.'
          }
        },
        required: ['scriptId', 'deploymentId']
      }
    }
  }
};

export { apiTool };