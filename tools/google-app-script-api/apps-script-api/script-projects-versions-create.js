/**
 * Function to create a new version of a Google Apps Script project.
 *
 * @param {Object} args - Arguments for creating a new version.
 * @param {string} args.scriptId - The ID of the script project.
 * @param {string} args.description - A description for the new version.
 * @param {string} args.createTime - The creation time of the version.
 * @param {number} args.versionNumber - The version number to be assigned.
 * @returns {Promise<Object>} - The result of the version creation.
 */
const executeFunction = async ({ scriptId, description, createTime, versionNumber }) => {
  const baseUrl = 'https://script.googleapis.com';
  const token = process.env.GOOGLE_APP_SCRIPT_API_API_KEY;
  const url = `${baseUrl}/v1/projects/${scriptId}/versions?fields=*&alt=json`;

  const body = JSON.stringify({
    description,
    createTime,
    versionNumber,
    scriptId
  });

  try {
    // Set up headers for the request
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Perform the fetch request
    const response = await fetch(url, {
      method: 'POST',
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
    console.error('Error creating version:', error);
    return { error: 'An error occurred while creating the version.' };
  }
};

/**
 * Tool configuration for creating a new version of a Google Apps Script project.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'script_projects_versions_create',
      description: 'Creates a new version of a Google Apps Script project.',
      parameters: {
        type: 'object',
        properties: {
          scriptId: {
            type: 'string',
            description: 'The ID of the script project.'
          },
          description: {
            type: 'string',
            description: 'A description for the new version.'
          },
          createTime: {
            type: 'string',
            description: 'The creation time of the version.'
          },
          versionNumber: {
            type: 'integer',
            description: 'The version number to be assigned.'
          }
        },
        required: ['scriptId', 'description', 'createTime', 'versionNumber']
      }
    }
  }
};

export { apiTool };