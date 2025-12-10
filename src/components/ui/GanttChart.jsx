import React, { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { useGanttChart } from '../../hook/useChart';

const GanttChart = ({ projectId }) => {
    const {
        data: apiData,
        project,
        groups: apiGroups,
        statistics,
        loading,
        error,
        isEmpty,
        refresh
    } = useGanttChart(projectId);

    const [expandedGroups, setExpandedGroups] = useState({});
    const [hoveredItem, setHoveredItem] = useState(null);
    const [viewMode, setViewMode] = useState('auto');

    const data = useMemo(() => {
        if (!apiData || !apiData.groups || !Array.isArray(apiData.groups)) {
            return null;
        }

        return {
            project: project || { id: projectId, name: 'Unknown Project' },
            groups: apiGroups || []
        };
    }, [apiData, project, apiGroups, projectId]);

    useEffect(() => {
        if (data?.groups && Array.isArray(data.groups) && data.groups.length > 0) {
            const expanded = {};
            data.groups.forEach(group => {
                expanded[group.groupId] = true;
            });
            setExpandedGroups(expanded);
        }
    }, [data]);

    const dateRange = useMemo(() => {
        if (!data || !data.groups || !Array.isArray(data.groups) || data.groups.length === 0) {
            const today = new Date();
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return { start, end, days };
        }

        const dates = [];

        data.groups.forEach(group => {
            if (group.start_date) dates.push(new Date(group.start_date));
            if (group.due_date) dates.push(new Date(group.due_date));
            if (group.finish_date) dates.push(new Date(group.finish_date));

            if (group.tasks && Array.isArray(group.tasks)) {
                group.tasks.forEach(task => {
                    if (task.start_date) dates.push(new Date(task.start_date));
                    if (task.due_date) dates.push(new Date(task.due_date));
                    if (task.finish_date) dates.push(new Date(task.finish_date));
                });
            }
        });

        if (dates.length === 0) {
            const today = new Date();
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return { start, end, days };
        }

        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));

        let start, end;

        switch (viewMode) {
            case 'month': {
                start = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
                const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
                end = new Date(maxMonth);
                break;
            }

            case 'quarter': {
                start = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
                end = new Date(start.getFullYear(), start.getMonth() + 3, 0);
                break;
            }

            case 'custom': {
                const today = new Date();
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 3, 0);
                break;
            }

            default: {
                start = new Date(minDate);
                end = new Date(maxDate);
                start.setDate(start.getDate() - 3);
                end.setDate(end.getDate() + 7);
                break;
            }
        }

        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

        return { start, end, days };
    }, [data, viewMode]);

    const calendarColumns = useMemo(() => {
        const columns = [];
        const current = new Date(dateRange.start);
        current.setHours(0, 0, 0, 0);

        for (let i = 0; i < dateRange.days; i++) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isToday = current.getTime() === today.getTime();

            columns.push({
                date: new Date(current),
                day: current.getDate(),
                month: current.getMonth(),
                year: current.getFullYear(),
                isWeekend: current.getDay() === 0 || current.getDay() === 6,
                isToday,
                isMonthStart: current.getDate() === 1
            });
            current.setDate(current.getDate() + 1);
        }

        return columns;
    }, [dateRange]);

    const calculateBarStyle = (startDate, dueDate, finishDate) => {
        if (!startDate || !dueDate) return null;

        const start = new Date(startDate);
        const due = new Date(dueDate);
        const finish = finishDate ? new Date(finishDate) : null;

        start.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        if (finish) finish.setHours(0, 0, 0, 0);

        const rangeStart = new Date(dateRange.start);
        rangeStart.setHours(0, 0, 0, 0);

        const startOffset = Math.floor((start - rangeStart) / (1000 * 60 * 60 * 24));
        const dueDays = Math.ceil((due - start) / (1000 * 60 * 60 * 24)) + 1;

        let status = 'ongoing';
        let actualWidth = dueDays;

        if (finish) {
            const finishDays = Math.ceil((finish - start) / (1000 * 60 * 60 * 24)) + 1;
            actualWidth = finishDays;

            if (finish < due) {
                status = 'early';
            } else if (finish.getTime() === due.getTime()) {
                status = 'ontime';
            } else {
                status = 'late';
            }
        }

        return {
            left: `${(startOffset / dateRange.days) * 100}%`,
            width: `${(actualWidth / dateRange.days) * 100}%`,
            plannedWidth: `${(dueDays / dateRange.days) * 100}%`,
            status
        };
    };

    const toggleGroup = (groupId) => {
        setExpandedGroups(prev => ({
            ...prev,
            [groupId]: !prev[groupId]
        }));
    };

    const getStatusColor = (status) => {
        const colors = {
            'Done': 'text-green-600 bg-green-50',
            'In Progress': 'text-blue-600 bg-blue-50',
            'To Do': 'text-gray-600 bg-gray-50',
            'Hold': 'text-orange-600 bg-orange-50',
            'Blocked': 'text-red-600 bg-red-50'
        };
        return colors[status] || 'text-gray-600 bg-gray-50';
    };

    const getBarColor = (status) => {
        const colors = {
            'early': 'bg-gradient-to-r from-green-400 to-green-500',
            'ontime': 'bg-gradient-to-r from-cyan-400 to-cyan-500',
            'late': 'bg-gradient-to-r from-red-400 to-red-500',
            'ongoing': 'bg-gradient-to-r from-blue-400 to-blue-500'
        };
        return colors[status] || colors.ongoing;
    };

    const getGroupBarColor = () => {
        return 'bg-gradient-to-r from-indigo-500 to-indigo-600';
    };

    if (loading) {
        return (
            <div className="w-full h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Loading Gantt Chart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-red-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Error Loading Data</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button
                        onClick={refresh}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!data || isEmpty) {
        return (
            <div className="w-full h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="text-slate-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">No Data Available</h2>
                    <p className="text-slate-600 mb-6">There are no groups or tasks in this project yet.</p>
                    <button
                        onClick={refresh}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Refresh
                    </button>
                </div>
            </div>
        );
    }

    const cellWidth = 40;
    const totalWidth = dateRange.days * cellWidth;

    return (
        <div className="w-full h-screen bg-linear-to-br from-slate-50 to-slate-100 p-6 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">{data.project.name}</h1>
                        <p className="text-slate-600">
                            {statistics?.totalGroups || 0} Groups • {statistics?.totalTasks || 0} Tasks • {dateRange.days} Days
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {dateRange.start.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} - {dateRange.end.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        {/* View Mode Selector */}
                        <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('auto')}
                                className={`px-3 py-1.5 text-sm rounded transition-colors ${viewMode === 'auto'
                                    ? 'bg-white text-slate-800 shadow'
                                    : 'text-slate-600 hover:text-slate-800'
                                    }`}
                            >
                                Auto
                            </button>
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-3 py-1.5 text-sm rounded transition-colors ${viewMode === 'month'
                                    ? 'bg-white text-slate-800 shadow'
                                    : 'text-slate-600 hover:text-slate-800'
                                    }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setViewMode('quarter')}
                                className={`px-3 py-1.5 text-sm rounded transition-colors ${viewMode === 'quarter'
                                    ? 'bg-white text-slate-800 shadow'
                                    : 'text-slate-600 hover:text-slate-800'
                                    }`}
                            >
                                Quarter
                            </button>
                            <button
                                onClick={() => setViewMode('custom')}
                                className={`px-3 py-1.5 text-sm rounded transition-colors ${viewMode === 'custom'
                                    ? 'bg-white text-slate-800 shadow'
                                    : 'text-slate-600 hover:text-slate-800'
                                    }`}
                            >
                                3 Months
                            </button>
                        </div>

                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {statistics?.overallProgress || 0}%
                            </div>
                            <div className="text-sm text-slate-600">Progress</div>
                        </div>
                        <button
                            onClick={refresh}
                            className="p-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Refresh Data"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex gap-6 mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-3 rounded bg-linear-to-r from-green-400 to-green-500"></div>
                        <span className="text-sm text-slate-600">Completed Early</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-3 rounded bg-linear-to-r from-cyan-400 to-cyan-500"></div>
                        <span className="text-sm text-slate-600">Completed On Time</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-3 rounded bg-linear-to-r from-red-400 to-red-500"></div>
                        <span className="text-sm text-slate-600">Completed Overdue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-3 rounded bg-linear-to-r from-blue-400 to-blue-500"></div>
                        <span className="text-sm text-slate-600">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                        <div className="w-0.5 h-6 bg-blue-500"></div>
                        <span className="text-sm text-slate-600">Today</span>
                    </div>
                </div>
            </div>

            {/* Gantt Chart */}
            <div className="bg-white rounded-xl shadow-lg flex-1 overflow-hidden flex flex-col">
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel - Task List */}
                    <div className="w-80 shrink-0 border-r border-slate-200 flex flex-col">
                        <div className="bg-slate-50 p-4 border-b border-slate-200 font-semibold text-slate-700 h-16 flex items-center">
                            Task Name
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {data.groups.map((group) => (
                                <div key={group.groupId}>
                                    <div
                                        className={`flex items-center gap-3 p-4 border-b border-slate-200 cursor-pointer transition-all duration-200 ${hoveredItem === group.groupId ? 'bg-slate-50' : 'bg-white'
                                            }`}
                                        onClick={() => toggleGroup(group.groupId)}
                                        onMouseEnter={() => setHoveredItem(group.groupId)}
                                        onMouseLeave={() => setHoveredItem(null)}
                                    >
                                        <button className="text-slate-600 hover:text-slate-900 transition-colors">
                                            {expandedGroups[group.groupId] ? (
                                                <ChevronDown size={18} />
                                            ) : (
                                                <ChevronRight size={18} />
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-slate-800 mb-1 wrap-break-word">{group.nama}</div>
                                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle size={12} />
                                                    {group.completedTask}/{group.totalTask}
                                                </span>
                                                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                                                    {group.progress}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {expandedGroups[group.groupId] && group.tasks?.map((task) => (
                                        <div
                                            key={task.taskId}
                                            className={`flex items-center h-18 gap-3 p-4 pl-12 border-b border-slate-100 transition-all duration-200 ${hoveredItem === task.taskId ? 'bg-blue-50' : 'bg-white'
                                                }`}
                                            onMouseEnter={() => setHoveredItem(task.taskId)}
                                            onMouseLeave={() => setHoveredItem(null)}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="text-slate-700 mb-1 wrap-break-word">{task.nama}</div>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(task.status)}`}>
                                                    {task.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel - Timeline */}
                    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                        <div className="bg-slate-50 border-b border-slate-200 overflow-x-auto overflow-y-hidden">
                            <div className="relative" style={{ width: `${totalWidth}px`, height: '64px' }}>
                                {/* Month Headers */}
                                <div className="absolute top-0 left-0 right-0 h-8 flex">
                                    {calendarColumns.map((col, idx) => (
                                        col.isMonthStart && (
                                            <div
                                                key={`month-${idx}`}
                                                className="absolute top-0 h-8 flex items-center justify-center bg-slate-100 border-r border-slate-300 font-bold text-xs text-slate-700"
                                                style={{
                                                    left: `${idx * cellWidth}px`,
                                                    width: `${calendarColumns.filter(c => c.month === col.month && c.year === col.year).length * cellWidth}px`
                                                }}
                                            >
                                                {col.date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                                            </div>
                                        )
                                    ))}
                                </div>

                                {/* Day Headers */}
                                <div className="absolute top-8 left-0 right-0 h-14 flex">
                                    {calendarColumns.map((col, idx) => (
                                        <div
                                            key={idx}
                                            className={`shrink-0 flex flex-col items-center justify-center border-r border-slate-200 ${col.isWeekend ? 'bg-slate-100' : 'bg-white'
                                                } ${col.isToday ? 'bg-blue-50' : ''}`}
                                            style={{ width: `${cellWidth}px` }}
                                        >
                                            <div className={`text-xs font-semibold ${col.isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                                                {col.day}
                                            </div>
                                            <div className={`text-xs ${col.isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                                                {col.date.toLocaleDateString('id-ID', { weekday: 'short' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <div className="relative" style={{ width: `${totalWidth}px` }}>
                                {/* Today Indicator */}
                                {calendarColumns.map((col, idx) => (
                                    col.isToday && (
                                        <div
                                            key={`today-${idx}`}
                                            className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10 pointer-events-none"
                                            style={{ left: `${idx * cellWidth}px` }}
                                        />
                                    )
                                ))}

                                {/* Weekend Background */}
                                {calendarColumns.map((col, idx) => (
                                    col.isWeekend && (
                                        <div
                                            key={`weekend-${idx}`}
                                            className="absolute top-0 bottom-0 bg-slate-50 pointer-events-none"
                                            style={{
                                                left: `${idx * cellWidth}px`,
                                                width: `${cellWidth}px`
                                            }}
                                        />
                                    )
                                ))}

                                {/* Grid Lines */}
                                {calendarColumns.map((col, idx) => (
                                    <div
                                        key={`grid-${idx}`}
                                        className="absolute top-0 bottom-0 border-r border-slate-200 pointer-events-none"
                                        style={{ left: `${idx * cellWidth}px` }}
                                    />
                                ))}

                                {/* Bars */}
                                {data.groups.map((group) => {
                                    const groupBar = calculateBarStyle(group.start_date, group.due_date, group.finish_date);

                                    return (
                                        <div key={group.groupId}>
                                            <div
                                                className={`relative border-b border-slate-200 transition-all duration-200 ${hoveredItem === group.groupId ? 'bg-slate-50' : ''
                                                    }`}
                                                style={{ height: '5em' }}
                                            >
                                                {groupBar && (
                                                    <div className="relative h-full flex items-center px-2">
                                                        <div
                                                            className="absolute h-8 border-2 border-dashed border-slate-300 rounded-lg opacity-50"
                                                            style={{
                                                                left: groupBar.left,
                                                                width: groupBar.plannedWidth
                                                            }}
                                                        />
                                                        <div
                                                            className={`absolute h-8 rounded-lg shadow-md transition-all duration-300 ${getGroupBarColor()} ${hoveredItem === group.groupId ? 'scale-105 shadow-lg' : ''
                                                                }`}
                                                            style={{
                                                                left: groupBar.left,
                                                                width: groupBar.width
                                                            }}
                                                        >
                                                            <div className="h-full flex items-center justify-center text-white text-xs font-semibold px-2 truncate">
                                                                {group.nama}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {expandedGroups[group.groupId] && group.tasks?.map((task) => {
                                                const taskBar = calculateBarStyle(task.start_date, task.due_date, task.finish_date);
                                                return (
                                                    <div
                                                        key={task.taskId}
                                                        className={`relative border-b border-slate-100 transition-all duration-200 ${hoveredItem === task.taskId ? 'bg-blue-50' : ''
                                                            }`}
                                                        style={{ height: '4.5em' }}
                                                    >
                                                        {taskBar && (
                                                            <div className="relative h-full flex items-center px-2">
                                                                <div
                                                                    className="absolute h-6 border border-dashed border-slate-300 rounded opacity-40"
                                                                    style={{
                                                                        left: taskBar.left,
                                                                        width: taskBar.plannedWidth
                                                                    }}
                                                                />
                                                                <div
                                                                    className={`absolute h-6 rounded shadow transition-all duration-300 ${getBarColor(taskBar.status)} ${hoveredItem === task.taskId ? 'scale-105 shadow-md' : ''
                                                                        }`}
                                                                    style={{
                                                                        left: taskBar.left,
                                                                        width: taskBar.width
                                                                    }}
                                                                >
                                                                    <div className="h-full flex items-center justify-center text-white text-xs px-2 truncate">
                                                                        {task.nama}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GanttChart;