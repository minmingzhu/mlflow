import { WorkflowService } from './sdk/WorkflowService';
import { getUUID, wrapDeferred } from '../common/utils/ActionUtils';
import { searchRunsPayload } from '../experiment-tracking/actions'

export const SEARCH_MAX_RESULTS = 100;

export const GET_WORKFLOW_DURATION_API = 'GET_WORKFLOW_DURATION';
export const getworkflowduration = (runUuid, metricKey, id = getUUID()) => {
  return {
    type: GET_WORKFLOW_DURATION_API,
    payload: wrapDeferred(WorkflowService.getMetricHistory, {
      run_uuid: runUuid,
      metric_key: decodeURIComponent(metricKey),
    }),
    meta: { id: id, runUuid: runUuid, key: metricKey },
  };
};

export const GET_RUNUUID_BY_EXPERIMENT_ID_API = 'GET_RUNUUID_BY_EXPERIMENT_ID';
export const getRunuuidByExperimentidApi = (experimentId, id = getUUID()) => { 
  return {
    type: GET_RUNUUID_BY_EXPERIMENT_ID_API,
    payload: wrapDeferred(WorkflowService.listRuns, {}),
    meta: { id: id },
  };
};

export const SEARCH_RUNS_API_WITH_UUID = 'SEARCH_RUNS_API_WITH_UUID';
export const searchRunsApiWithUuid = (params) => ({
  type: SEARCH_RUNS_API_WITH_UUID,
  payload: searchRunsPayload(params),
  meta: { id: params.id || getUUID() },
});