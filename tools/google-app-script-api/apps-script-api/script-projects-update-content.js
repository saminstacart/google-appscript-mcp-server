/**
 * Function to update the content of a Google Apps Script project.
 *
 * @param {Object} args - Arguments for the update.
 * @param {string} args.scriptId - The ID of the script project to update.
 * @param {Array<Object>} args.files - The files to be updated in the script project.
 * @returns {Promise<Object>} - The result of the update operation.
 */
const executeFunction = async ({ scriptId, files }) => {
  const baseUrl = 'https://script.googleapis.com';
  const token = process.env.GOOGLE_APP_SCRIPT_API_API_KEY;
  const apiKey = process.env.GOOGLE_APP_SCRIPT_API_API_KEY;

  try {
    // Construct the URL for the request
    const url = `${baseUrl}/v1/projects/${scriptId}/content?key=${apiKey}`;

    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Prepare the body of the request
    const body = JSON.stringify({ scriptId, files });

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
    console.error('Error updating script project content:', error);
    return { error: 'An error occurred while updating the script project content.' };
  }
};

/**
 * Tool configuration for updating Google Apps Script project content.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'update_script_content',
      description: 'Updates the content of a specified Google Apps Script project.',
      parameters: {
        type: 'object',
        properties: {
          scriptId: {
            type: 'string',
            description: 'The ID of the script project to update.'
          },
          files: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                  description: 'The name of the file.'
                },
                lastModifyUser: {
                  type: 'object',
                  properties: {
                    photoUrl: { type: 'string' },
                    domain: { type: 'string' },
                    name: { type: 'string' },
                    email: { type: 'string' }
                  }
                },
                type: {
                  type: 'string',
                  description: 'The type of the file.'
                },
                updateTime: { type: 'string' },
                source: { type: 'string' },
                createTime: { type: 'string' },
                functionSet: {
                  type: 'object',
                  properties: {
                    values: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          parameters: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                value: { type: 'string' }
                              }
                            }
                          },
                          name: { type: 'string' }
                        }
                      }
                    }
                  }
                }
              }
            },
            description: 'The files to be updated in the script project.'
          }
        },
        required: ['scriptId', 'files']
      }
    }
  }
};

export { apiTool };