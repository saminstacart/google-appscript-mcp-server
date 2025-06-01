import { logger } from '../../../lib/logger.js';

/**
 * Function to delete a deployment of an Apps Script project.
 *
 * @param {Object} args - Arguments for the deletion.
 * @param {string} args.scriptId - The ID of the script project.
 * @param {string} args.deploymentId - The ID of the deployment to delete.
 * @returns {Promise<Object>} - The result of the deletion operation.
 */
const executeFunction = async ({ scriptId, deploymentId }) => {
  const baseUrl = 'https://script.googleapis.com';
  const accessToken = ''; // will be provided by the user
  try {
    // Construct the URL for the DELETE request
    const url = `${baseUrl}/v1/projects/${scriptId}/deployments/${deploymentId}?fields=occaecat dolor eu&alt=json&$.xgafv=1&upload_protocol=occaecat dolor eu&uploadType=occaecat dolor eu&quotaUser=occaecat dolor eu&callback=occaecat dolor eu&prettyPrint=true`;

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'DELETE',
      headers
    });

    // Check if the response was successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData);
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

    logger.error('DEPLOYMENT_DELETE', 'Error deleting deployment', errorDetails);
    
    console.error('❌ Error deleting deployment:', errorDetails);
    
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
 * Tool configuration for deleting a deployment of an Apps Script project.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'script_projects_deployments_delete',
      description: 'Delete a deployment of an Apps Script project.',
      parameters: {
        type: 'object',
        properties: {
          scriptId: {
            type: 'string',
            description: 'The ID of the script project.'
          },
          deploymentId: {
            type: 'string',
            description: 'The ID of the deployment to delete.'
          }
        },
        required: ['scriptId', 'deploymentId']
      }
    }
  }
};

export { apiTool };