/**
 * Function to get the content of a Google Apps Script project.
 *
 * @param {Object} args - Arguments for the request.
 * @param {string} args.scriptId - The ID of the script project to retrieve content for.
 * @param {string} [args.versionNumber="23988349"] - The version number of the script project.
 * @param {string} [args.fields] - Selector specifying which fields to include in a partial response.
 * @param {string} [args.alt="json"] - Data format for response.
 * @param {string} [args.key] - API key for the project.
 * @param {string} [args.access_token] - OAuth access token.
 * @param {string} [args.prettyPrint="true"] - Returns response with indentations and line breaks.
 * @returns {Promise<Object>} - The content of the script project.
 */
const executeFunction = async ({ scriptId, versionNumber = "23988349", fields, alt = "json", key, access_token, prettyPrint = "true" }) => {
  const baseUrl = 'https://script.googleapis.com';
  const token = process.env.GOOGLE_APP_SCRIPT_API_API_KEY;
  try {
    // Construct the URL with query parameters
    const url = new URL(`${baseUrl}/v1/projects/${scriptId}/content`);
    url.searchParams.append('versionNumber', versionNumber);
    if (fields) url.searchParams.append('fields', fields);
    url.searchParams.append('alt', alt);
    if (key) url.searchParams.append('key', key);
    url.searchParams.append('$.xgafv', '1');
    url.searchParams.append('upload_protocol', 'raw');
    url.searchParams.append('uploadType', 'media');
    if (access_token) url.searchParams.append('access_token', access_token);
    url.searchParams.append('quotaUser', 'user');
    url.searchParams.append('oauth_token', access_token);
    url.searchParams.append('callback', 'callback');
    url.searchParams.append('prettyPrint', prettyPrint);

    // Set up headers for the request
    const headers = {
      'Accept': 'application/json'
    };

    // If a token is provided, add it to the Authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

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
    console.error('Error getting script project content:', error);
    return { error: 'An error occurred while getting script project content.' };
  }
};

/**
 * Tool configuration for getting the content of a Google Apps Script project.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'script_projects_get_content',
      description: 'Get the content of a Google Apps Script project.',
      parameters: {
        type: 'object',
        properties: {
          scriptId: {
            type: 'string',
            description: 'The ID of the script project to retrieve content for.'
          },
          versionNumber: {
            type: 'string',
            description: 'The version number of the script project.'
          },
          fields: {
            type: 'string',
            description: 'Selector specifying which fields to include in a partial response.'
          },
          alt: {
            type: 'string',
            description: 'Data format for response.'
          },
          key: {
            type: 'string',
            description: 'API key for the project.'
          },
          access_token: {
            type: 'string',
            description: 'OAuth access token.'
          },
          prettyPrint: {
            type: 'string',
            description: 'Returns response with indentations and line breaks.'
          }
        },
        required: ['scriptId']
      }
    }
  }
};

export { apiTool };