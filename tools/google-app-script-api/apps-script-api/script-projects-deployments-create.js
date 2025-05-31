import { getAuthHeaders } from '../../../lib/oauth-helper.js';

/**
 * Function to create a deployment of an Apps Script project.
 *
 * @param {Object} args - Arguments for creating the deployment.
 * @param {string} args.scriptId - The ID of the script to deploy.
 * @param {string} args.manifestFileName - The name of the manifest file.
 * @param {number} args.versionNumber - The version number of the script.
 * @param {string} args.description - A description for the deployment.
 * @returns {Promise<Object>} - The result of the deployment creation.
 */
const executeFunction = async ({ scriptId, manifestFileName, versionNumber, description }) => {
  const baseUrl = 'https://script.googleapis.com';
  const url = `${baseUrl}/v1/projects/${scriptId}/deployments?fields=occaecat dolor eu&alt=json`;

  const body = {
    scriptId,
    manifestFileName,
    versionNumber,
    description
  };

  try {
    // Get OAuth headers
    const headers = await getAuthHeaders();
    headers['Content-Type'] = 'application/json';

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
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
    console.error('Error creating deployment:', error);
    return { error: 'An error occurred while creating the deployment.' };
  }
};

/**
 * Tool configuration for creating a deployment of an Apps Script project.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'script_projects_deployments_create',
      description: 'Creates a deployment of an Apps Script project.',
      parameters: {
        type: 'object',
        properties: {
          scriptId: {
            type: 'string',
            description: 'The ID of the script to deploy.'
          },
          manifestFileName: {
            type: 'string',
            description: 'The name of the manifest file.'
          },
          versionNumber: {
            type: 'number',
            description: 'The version number of the script.'
          },
          description: {
            type: 'string',
            description: 'A description for the deployment.'
          }
        },
        required: ['scriptId', 'manifestFileName', 'versionNumber', 'description']
      }
    }
  }
};

export { apiTool };