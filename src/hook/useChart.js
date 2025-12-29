import { useState, useEffect, useCallback, useMemo } from 'react';
import { getDataGanttChartProject } from '../services/chart';

export const useGanttChart = (projectId, options = {}) => {
    const {
        autoFetch = true,
        onSuccess,
        onError
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchGanttData = useCallback(async () => {
        if (!projectId) {
            setError('Project ID is required');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await getDataGanttChartProject(projectId);
            if (!result || typeof result !== 'object') {
                throw new Error('Invalid data structure received from API');
            }
            if (!result.groups || !Array.isArray(result.groups)) {
                setData({
                    project: result.project || { id: projectId, name: 'Unknown Project' },
                    groups: []
                });
            } else {
                setData(result);
            }

            if (onSuccess) {
                onSuccess(result);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch gantt chart data';
            setError(errorMessage);
            setData(null);

            if (onError) {
                onError(err);
            }
        } finally {
            setLoading(false);
        }
    }, [projectId, onSuccess, onError]);

    useEffect(() => {
        if (autoFetch && projectId) {
            setLoading(true);
            fetchGanttData();
        }
    }, [projectId, autoFetch, refreshKey]); 

    const refresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    const refetch = useCallback(() => {
        return fetchGanttData();
    }, [fetchGanttData]);

    const project = useMemo(() => {
        return data?.project || null;
    }, [data]);

    const groups = useMemo(() => {
        return Array.isArray(data?.groups) ? data.groups : [];
    }, [data]);

    const allTasks = useMemo(() => {
        if (!data?.groups || !Array.isArray(data.groups)) return [];

        return data.groups.flatMap(group => {
            if (!group.tasks || !Array.isArray(group.tasks)) return [];

            return group.tasks.map(task => ({
                ...task,
                groupId: group.groupId,
                groupName: group.nama
            }));
        });
    }, [data]);

    const tasksByStatus = useMemo(() => {
        const statusMap = {
            'To Do': [],
            'In Progress': [],
            'Done': [],
            'Hold': [],
            'Blocked': []
        };

        allTasks.forEach(task => {
            if (task.status && statusMap.hasOwnProperty(task.status)) {
                statusMap[task.status].push(task);
            }
        });

        return statusMap;
    }, [allTasks]);

    const statistics = useMemo(() => {
        if (!data?.groups || !Array.isArray(data.groups)) {
            return {
                totalGroups: 0,
                totalTasks: 0,
                completedTasks: 0,
                overallProgress: 0,
                statusCount: {
                    todo: 0,
                    inProgress: 0,
                    done: 0,
                    hold: 0,
                    blocked: 0
                },
                tasksWithDates: 0,
                tasksWithoutDates: 0,
                dateRange: {
                    earliest: null,
                    latest: null
                }
            };
        }

        const totalGroups = data.groups.length;
        const totalTasks = data.groups.reduce((sum, group) => sum + (group.totalTask || 0), 0);
        const completedTasks = data.groups.reduce((sum, group) => sum + (group.completedTask || 0), 0);
        const overallProgress = totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;

        const statusCount = {
            todo: tasksByStatus['To Do']?.length || 0,
            inProgress: tasksByStatus['In Progress']?.length || 0,
            done: tasksByStatus['Done']?.length || 0,
            hold: tasksByStatus['Hold']?.length || 0,
            blocked: tasksByStatus['Blocked']?.length || 0
        };

        const tasksWithDates = allTasks.filter(task => task.start_date || task.due_date);
        const tasksWithoutDates = allTasks.filter(task => !task.start_date && !task.due_date);

        let earliestDate = null;
        let latestDate = null;

        allTasks.forEach(task => {
            const dates = [task.start_date, task.due_date, task.finish_date].filter(Boolean);
            dates.forEach(dateStr => {
                const d = new Date(dateStr);
                // ✅ FIX: Validasi tanggal yang valid
                if (!isNaN(d.getTime())) {
                    if (!earliestDate || d < earliestDate) earliestDate = d;
                    if (!latestDate || d > latestDate) latestDate = d;
                }
            });
        });

        return {
            totalGroups,
            totalTasks,
            completedTasks,
            overallProgress,
            statusCount,
            tasksWithDates: tasksWithDates.length,
            tasksWithoutDates: tasksWithoutDates.length,
            dateRange: {
                earliest: earliestDate,
                latest: latestDate
            }
        };
    }, [data, allTasks, tasksByStatus]);

    const getGroupById = useCallback((groupId) => {
        return groups.find(group => group.groupId === groupId) || null;
    }, [groups]);

    const getTaskById = useCallback((taskId) => {
        return allTasks.find(task => task.taskId === taskId) || null;
    }, [allTasks]);

    const getTasksByGroup = useCallback((groupId) => {
        const group = getGroupById(groupId);
        return Array.isArray(group?.tasks) ? group.tasks : [];
    }, [getGroupById]);

    const filterTasksByStatus = useCallback((status) => {
        return allTasks.filter(task => task.status === status);
    }, [allTasks]);

    const filterGroupsByProgress = useCallback((minProgress = 0, maxProgress = 100) => {
        return groups.filter(group =>
            (group.progress || 0) >= minProgress && (group.progress || 0) <= maxProgress
        );
    }, [groups]);

    const filterTasksWithoutDates = useCallback(() => {
        return allTasks.filter(task => !task.start_date && !task.due_date);
    }, [allTasks]);

    return {
        data,
        project,
        groups,
        allTasks,
        tasksByStatus,
        statistics,
        loading,
        error,
        isEmpty: !loading && (!data || !Array.isArray(data.groups) || data.groups.length === 0),
        refresh,
        refetch,
        getGroupById,
        getTaskById,
        getTasksByGroup,
        filterTasksByStatus,
        filterGroupsByProgress,
        filterTasksWithoutDates
    };
};

export default useGanttChart;