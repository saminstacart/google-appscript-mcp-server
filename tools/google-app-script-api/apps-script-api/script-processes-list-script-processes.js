/**
 * Function to list script processes for a given script ID.
 *
 * @param {Object} args - Arguments for listing script processes.
 * @param {string} args.scriptId - The ID of the script to list processes for.
 * @param {number} [args.pageSize=100] - The number of processes to return per page.
 * @param {string} [args.functionName] - Filter by function name.
 * @param {string} [args.pageToken] - Token for pagination.
 * @param {string} [args.startTime] - Filter by start time.
 * @param {string} [args.endTime] - Filter by end time.
 * @param {string} [args.deploymentId] - Filter by deployment ID.
 * @param {string} [args.types] - Filter by process types.
 * @param {string} [args.statuses] - Filter by process statuses.
 * @param {string} [args.userAccessLevels] - Filter by user access levels.
 * @returns {Promise<Object>} - The result of the script processes listing.
 */
const executeFunction = async ({ scriptId, pageSize = 100, functionName, pageToken, startTime, endTime, deploymentId, types, statuses, userAccessLevels }) => {
  const baseUrl = 'https://script.googleapis.com';
  const accessToken = ''; // will be provided by the user
  try {
    // Construct the URL with query parameters
    const url = new URL(`${baseUrl}/v1/processes:listScriptProcesses`);
    url.searchParams.append('scriptId', scriptId);
    url.searchParams.append('pageSize', pageSize.toString());
    if (functionName) url.searchParams.append('scriptProcessFilter.functionName', functionName);
    if (pageToken) url.searchParams.append('pageToken', pageToken);
    if (startTime) url.searchParams.append('scriptProcessFilter.startTime', startTime);
    if (endTime) url.searchParams.append('scriptProcessFilter.endTime', endTime);
    if (deploymentId) url.searchParams.append('scriptProcessFilter.deploymentId', deploymentId);
    if (types) url.searchParams.append('scriptProcessFilter.types', types);
    if (statuses) url.searchParams.append('scriptProcessFilter.statuses', statuses);
    if (userAccessLevels) url.searchParams.append('scriptProcessFilter.userAccessLevels', userAccessLevels);
    url.searchParams.append('alt', 'json');
    url.searchParams.append('prettyPrint', 'true');

    // Set up headers for the request
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    };

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
    console.error('Error listing script processes:', error);
    return { error: 'An error occurred while listing script processes.' };
  }
};

/**
 * Tool configuration for listing script processes on Google Apps Script.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'list_script_processes',
      description: 'List information about a script\'s executed processes.',
      parameters: {
        type: 'object',
        properties: {
          scriptId: {
            type: 'string',
            description: 'The ID of the script to list processes for.'
          },
          pageSize: {
            type: 'integer',
            description: 'The number of processes to return per page.'
          },
          functionName: {
            type: 'string',
            description: 'Filter by function name.'
          },
          pageToken: {
            type: 'string',
            description: 'Token for pagination.'
          },
          startTime: {
            type: 'string',
            description: 'Filter by start time.'
          },
          endTime: {
            type: 'string',
            description: 'Filter by end time.'
          },
          deploymentId: {
            type: 'string',
            description: 'Filter by deployment ID.'
          },
          types: {
            type: 'string',
            description: 'Filter by process types.'
          },
          statuses: {
            type: 'string',
            description: 'Filter by process statuses.'
          },
          userAccessLevels: {
            type: 'string',
            description: 'Filter by user access levels.'
          }
        },
        required: ['scriptId']
      }
    }
  }
};

export { apiTool };