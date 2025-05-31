/**
 * Function to get a deployment of an Apps Script project.
 *
 * @param {Object} args - Arguments for the deployment retrieval.
 * @param {string} args.scriptId - The ID of the script project.
 * @param {string} args.deploymentId - The ID of the deployment to retrieve.
 * @param {string} [args.fields] - Selector specifying which fields to include in a partial response.
 * @param {string} [args.alt='json'] - Data format for response.
 * @param {string} [args.access_token] - OAuth access token.
 * @param {string} [args.quotaUser] - Available to use for quota purposes for server-side applications.
 * @param {string} [args.prettyPrint='true'] - Returns response with indentations and line breaks.
 * @returns {Promise<Object>} - The result of the deployment retrieval.
 */
const executeFunction = async ({ scriptId, deploymentId, fields, alt = 'json', access_token, quotaUser, prettyPrint = 'true' }) => {
  const baseUrl = 'https://script.googleapis.com';
  const token = process.env.GOOGLE_APP_SCRIPT_API_API_KEY;
  const url = new URL(`${baseUrl}/v1/projects/${scriptId}/deployments/${deploymentId}`);
  
  // Append query parameters
  url.searchParams.append('fields', fields);
  url.searchParams.append('alt', alt);
  if (access_token) url.searchParams.append('access_token', access_token);
  if (quotaUser) url.searchParams.append('quotaUser', quotaUser);
  url.searchParams.append('prettyPrint', prettyPrint);
  url.searchParams.append('$.xgafv', '1');
  url.searchParams.append('upload_protocol', 'raw');
  url.searchParams.append('uploadType', 'media');

  // Set up headers for the request
  const headers = {
    'Accept': 'application/json'
  };

  // If a token is provided, add it to the Authorization header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    // Perform the fetch request
    const response = await fetch(url.toString(), {
      method: 'GET',
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
    console.error('Error retrieving deployment:', error);
    return { error: 'An error occurred while retrieving the deployment.' };
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
          },
          fields: {
            type: 'string',
            description: 'Selector specifying which fields to include in a partial response.'
          },
          alt: {
            type: 'string',
            enum: ['json', 'xml'],
            description: 'Data format for response.'
          },
          access_token: {
            type: 'string',
            description: 'OAuth access token.'
          },
          quotaUser: {
            type: 'string',
            description: 'Available to use for quota purposes for server-side applications.'
          },
          prettyPrint: {
            type: 'string',
            description: 'Returns response with indentations and line breaks.'
          }
        },
        required: ['scriptId', 'deploymentId']
      }
    }
  }
};

export { apiTool };