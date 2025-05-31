/**
 * Function to update a deployment of an Apps Script project.
 *
 * @param {Object} args - Arguments for the update.
 * @param {string} args.scriptId - The ID of the script to update.
 * @param {string} args.deploymentId - The ID of the deployment to update.
 * @param {Object} args.deploymentConfig - The configuration for the deployment.
 * @param {string} args.deploymentConfig.manifestFileName - The name of the manifest file.
 * @param {number} args.deploymentConfig.versionNumber - The version number of the deployment.
 * @param {string} args.deploymentConfig.description - A description of the deployment.
 * @returns {Promise<Object>} - The result of the deployment update.
 */
const executeFunction = async ({ scriptId, deploymentId, deploymentConfig }) => {
  const baseUrl = 'https://script.googleapis.com';
  const token = process.env.GOOGLE_APP_SCRIPT_API_API_KEY;
  const apiKey = process.env.GOOGLE_APP_SCRIPT_API_API_KEY;

  try {
    // Construct the URL for the request
    const url = `${baseUrl}/v1/projects/${scriptId}/deployments/${deploymentId}?key=${apiKey}&prettyPrint=true`;

    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Prepare the body of the request
    const body = JSON.stringify({ deploymentConfig });

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body
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
    console.error('Error updating deployment:', error);
    return { error: 'An error occurred while updating the deployment.' };
  }
};

/**
 * Tool configuration for updating a deployment of an Apps Script project.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'script_projects_deployments_update',
      description: 'Updates a deployment of an Apps Script project.',
      parameters: {
        type: 'object',
        properties: {
          scriptId: {
            type: 'string',
            description: 'The ID of the script to update.'
          },
          deploymentId: {
            type: 'string',
            description: 'The ID of the deployment to update.'
          },
          deploymentConfig: {
            type: 'object',
            properties: {
              manifestFileName: {
                type: 'string',
                description: 'The name of the manifest file.'
              },
              versionNumber: {
                type: 'integer',
                description: 'The version number of the deployment.'
              },
              description: {
                type: 'string',
                description: 'A description of the deployment.'
              }
            },
            required: ['manifestFileName', 'versionNumber', 'description']
          }
        },
        required: ['scriptId', 'deploymentId', 'deploymentConfig']
      }
    }
  }
};

export { apiTool };