import { getAuthHeaders } from '../../../lib/oauth-helper.js';
import { logger } from '../../../lib/logger.js';

/**
 * Function to list processes for a Google Apps Script project.
 *
 * @param {Object} args - Arguments for the process listing.
 * @param {string} args.scriptId - The ID of the script to filter processes.
 * @param {string} [args.startTime] - The start time for filtering processes.
 * @param {string} [args.functionName] - The name of the function to filter processes.
 * @param {string} [args.deploymentId] - The deployment ID to filter processes.
 * @param {string} [args.projectName] - The project name to filter processes.
 * @param {Array<string>} [args.statuses] - The statuses to filter processes.
 * @param {string} [args.pageToken] - Token for pagination.
 * @param {Array<string>} [args.types] - The types of processes to filter.
 * @param {Array<string>} [args.userAccessLevels] - User access levels to filter.
 * @param {number} [args.pageSize=100] - The number of processes to return per page.
 * @param {string} [args.endTime] - The end time for filtering processes.
 * @param {string} [args.fields] - Selector specifying which fields to include in a partial response.
 * @param {boolean} [args.prettyPrint=true] - Returns response with indentations and line breaks.
 * @returns {Promise<Object>} - The result of the process listing.
 */
const executeFunction = async ({
  scriptId,
  startTime,
  functionName,
  deploymentId,
  projectName,
  statuses,
  pageToken,
  types,
  userAccessLevels,
  pageSize = 100,
  endTime,
  fields,
  prettyPrint = true
}) => {
  const baseUrl = 'https://script.googleapis.com';
  const startTime_exec = Date.now();

  logger.info('API_CALL', 'Starting script processes list request', {
    scriptId,
    pageSize,
    startTime,
    endTime,
    functionName,
    deploymentId,
    baseUrl
  });

  try {
    // Validate required parameters
    if (!scriptId) {
      logger.error('API_CALL', 'Missing required parameter: scriptId');
      throw new Error('scriptId is required');
    }

    // Construct the URL with query parameters
    const url = new URL(`${baseUrl}/v1/processes`);
    const params = new URLSearchParams();
    params.append('userProcessFilter.scriptId', scriptId);
    if (startTime) params.append('userProcessFilter.startTime', startTime);
    if (functionName) params.append('userProcessFilter.functionName', functionName);
    if (deploymentId) params.append('userProcessFilter.deploymentId', deploymentId);
    if (projectName) params.append('userProcessFilter.projectName', projectName);
    if (statuses) params.append('userProcessFilter.statuses', statuses.join(','));
    if (pageToken) params.append('pageToken', pageToken);
    if (types) params.append('userProcessFilter.types', types.join(','));
    if (userAccessLevels) params.append('userProcessFilter.userAccessLevels', userAccessLevels.join(','));
    if (endTime) params.append('userProcessFilter.endTime', endTime);
    if (fields) params.append('fields', fields);
    params.append('pageSize', pageSize);
    params.append('prettyPrint', prettyPrint);
    
    url.search = params.toString();

    logger.debug('API_CALL', 'Constructed API URL', {
      url: url.toString(),
      queryParams: Object.fromEntries(params)
    });

    // Get OAuth headers
    logger.debug('API_CALL', 'Getting OAuth headers');
    const headers = await getAuthHeaders();

    logger.logAPICall('GET', url.toString(), headers);

    // Perform the fetch request
    const fetchStartTime = Date.now();
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers
    });
    
    const fetchDuration = Date.now() - fetchStartTime;
    const responseSize = response.headers.get('content-length') || 'unknown';
    
    logger.logAPIResponse('GET', url.toString(), response.status, fetchDuration, responseSize);

    // Check if the response was successful
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        errorData = { message: errorText };
      }

      logger.error('API_CALL', 'API request failed', {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        errorResponse: errorData,
        scriptId
      });
      
      throw new Error(`API Error (${response.status}): ${errorData.error?.message || errorData.message || 'Unknown error'}`);
    }

    // Parse and return the response data
    const data = await response.json();
    const totalDuration = Date.now() - startTime_exec;
    
    logger.info('API_CALL', 'Script processes list request completed successfully', {
      scriptId,
      processCount: data.processes ? data.processes.length : 0,
      hasNextPageToken: !!data.nextPageToken,
      totalDuration: `${totalDuration}ms`,
      responseSize: JSON.stringify(data).length
    });
    
    return data;
  } catch (error) {
    logger.error('API_CALL', 'Script processes list request failed', {
      scriptId,
      error: {
        message: error.message,
        stack: error.stack
      }
    });
    
    console.error('Error listing processes:', error);
    return { 
      error: true,
      message: error.message,
      details: {
        scriptId,
        timestamp: new Date().toISOString(),
        errorType: error.name || 'Unknown'
      }
    };
  }
};

/**
 * Tool configuration for listing processes in Google Apps Script.
 * @type {Object}
 */
const apiTool = {
  function: executeFunction,
  definition: {
    type: 'function',
    function: {
      name: 'script_processes_list',
      description: 'List processes for a Google Apps Script project.',
      parameters: {
        type: 'object',
        properties: {
          scriptId: {
            type: 'string',
            description: 'The ID of the script to filter processes.'
          },
          startTime: {
            type: 'string',
            description: 'The start time for filtering processes.'
          },
          functionName: {
            type: 'string',
            description: 'The name of the function to filter processes.'
          },
          deploymentId: {
            type: 'string',
            description: 'The deployment ID to filter processes.'
          },
          projectName: {
            type: 'string',
            description: 'The project name to filter processes.'
          },
          statuses: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The statuses to filter processes.'
          },
          pageToken: {
            type: 'string',
            description: 'Token for pagination.'
          },
          types: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'The types of processes to filter.'
          },
          userAccessLevels: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'User access levels to filter.'
          },
          pageSize: {
            type: 'integer',
            description: 'The number of processes to return per page.'
          },
          endTime: {
            type: 'string',
            description: 'The end time for filtering processes.'
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