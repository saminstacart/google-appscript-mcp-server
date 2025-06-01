import { getOAuthAccessToken } from '../../../lib/oauth-helper.js';

/**
 * Function to list the deployments of a Google Apps Script project.
 *
 * @param {Object} args - Arguments for the deployment listing.
 * @param {string} args.scriptId - The ID of the script project.
 * @param {number} [args.pageSize=50] - The number of deployments to return per page.
 * @param {string} [args.pageToken] - Token for pagination.
 * @param {string} [args.fields] - Selector specifying which fields to include in a partial response.
 * @param {boolean} [args.prettyPrint=true] - Returns response with indentations and line breaks.
 * @returns {Promise<Object>} - The result of the deployments listing.
 */
const executeFunction = async ({ scriptId, pageSize = 50, pageToken, fields, prettyPrint = true }) => {
  const baseUrl = 'https://script.googleapis.com';

  try {
    // Get OAuth access token
    const token = await getOAuthAccessToken();
    
    // Construct the URL with query parameters
    const url = new URL(`${baseUrl}/v1/projects/${scriptId}/deployments`);
    url.searchParams.append('pageSize', pageSize.toString());
    if (pageToken) url.searchParams.append('pageToken', pageToken);
    if (fields) url.searchParams.append('fields', fields);
    url.searchParams.append('alt', 'json');
    url.searchParams.append('prettyPrint', prettyPrint.toString());

    // Set up headers for the request
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Perform the fetch request
    const response = await fetch(url.toString(), {
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
    console.error('Error listing deployments:', error);
    return { error: 'An error occurred while listing deployments.' };
  }
};

/**
 * Tool configuration for listing deployments of a Google Apps Script project.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'script_projects_deployments_list',
      description: 'Lists the deployments of an Apps Script project.',
      parameters: {
        type: 'object',
        properties: {
          scriptId: {
            type: 'string',
            description: 'The ID of the script project.'
          },
          pageSize: {
            type: 'integer',
            description: 'The number of deployments to return per page.'
          },
          pageToken: {
            type: 'string',
            description: 'Token for pagination.'
          },
          fields: {
            type: 'string',
            description: 'Selector specifying which fields to include in a partial response.'
          },
          prettyPrint: {
            type: 'boolean',
            description: 'Returns response with indentations and line breaks.'
          }
        },
        required: ['scriptId']
      }
    }
  }
};

export { apiTool };