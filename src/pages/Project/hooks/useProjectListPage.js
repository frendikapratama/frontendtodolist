import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDivision } from "../../../hook/useDivision";
import { useProject } from "../../../hook/useProject";
import { getUsers } from "../../../services/userServices";
import {
  filterDivisions,
  filterUsers,
  getDivisionDisplayName,
  getUserDisplayName,
} from "../projectListUtils";

export const useProjectListPage = () => {
  const projectState = useProject();
  const { divisionQuery } = useDivision();
  const divisions = useMemo(
    () => divisionQuery.data || [],
    [divisionQuery.data],
  );
  const {
    search,
    setSearch,
    status,
    setStatus,
    projectManager,
    setProjectManager,
    sites,
    setSites,
    divisionId,
    setDivisionId,
    setPage,
    limit,
  } = projectState;

  const [users, setUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isProjectManagerDropdownOpen, setIsProjectManagerDropdownOpen] =
    useState(false);
  const [isDivisionDropdownOpen, setIsDivisionDropdownOpen] = useState(false);
  const [projectManagerSearch, setProjectManagerSearch] = useState("");
  const [divisionSearch, setDivisionSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  const projectManagerDropdownRef = useRef(null);
  const divisionDropdownRef = useRef(null);

  useEffect(() => {
    const closeDropdownsOnOutsideClick = (event) => {
      if (!projectManagerDropdownRef.current?.contains(event.target)) {
        setIsProjectManagerDropdownOpen(false);
      }
      if (!divisionDropdownRef.current?.contains(event.target)) {
        setIsDivisionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", closeDropdownsOnOutsideClick);
    return () =>
      document.removeEventListener("mousedown", closeDropdownsOnOutsideClick);
  }, []);

  useEffect(() => {
    if (searchInput !== search) setIsSearchPending(true);

    const timeoutId = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
      setIsSearchPending(false);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [search, searchInput, setPage, setSearch]);

  useEffect(() => {
    setIsUsersLoading(true);
    getUsers({ limit: 200, canAccess: "planify" })
      .then((response) => {
        if (response?.data) setUsers(response.data);
        else if (Array.isArray(response)) setUsers(response);
      })
      .catch((error) => console.error("Gagal memuat daftar user:", error))
      .finally(() => setIsUsersLoading(false));
  }, []);

  const projectList = projectState.projectQuery.data?.data || [];
  const summary = projectState.projectQuery.data?.summary || {};
  const pagination = projectState.projectQuery.data?.pagination || {};
  const totalProjects = pagination.total ?? summary.total ?? projectList.length;
  const totalPages =
    pagination.totalPages || Math.ceil(totalProjects / limit) || 1;
  const selectedProjectManagerName = useMemo(
    () => getUserDisplayName(users.find((user) => user._id === projectManager)),
    [users, projectManager],
  );
  const selectedDivisionName = useMemo(
    () =>
      getDivisionDisplayName(
        divisions.find((division) => division._id === divisionId),
      ),
    [divisions, divisionId],
  );

  const hasActiveFilters = Boolean(
    status || sites || projectManager || divisionId || searchInput,
  );

  const resetFilters = () => {
    setStatus("");
    setSites("");
    setProjectManager("");
    setDivisionId("");
    setSearchInput("");
    setSearch("");
    setProjectManagerSearch("");
    setDivisionSearch("");
    setPage(1);
  };

  const closeFormModal = useCallback(() => {
    setIsFormOpen(false);
    setSelectedProject(null);
    setIsFormDirty(false);
  }, []);

  const requestCloseFormModal = useCallback(() => {
    if (
      isFormDirty &&
      !window.confirm(
        "Perubahan yang belum disimpan akan hilang. Tutup form ini?",
      )
    )
      return;
    closeFormModal();
  }, [closeFormModal, isFormDirty]);

  useEffect(() => {
    const closeModalOnEscape = (event) => {
      if (event.key !== "Escape") return;
      if (projectToDelete) setProjectToDelete(null);
      else if (isFormOpen) requestCloseFormModal();
    };

    window.addEventListener("keydown", closeModalOnEscape);
    return () => window.removeEventListener("keydown", closeModalOnEscape);
  }, [isFormOpen, projectToDelete, requestCloseFormModal]);

  return {
    ...projectState,
    divisions,
    users,
    isUsersLoading,
    searchInput,
    setSearchInput,
    isSearchPending,
    isFilterOpen,
    setIsFilterOpen,
    isProjectManagerDropdownOpen,
    setIsProjectManagerDropdownOpen,
    isDivisionDropdownOpen,
    setIsDivisionDropdownOpen,
    projectManagerSearch,
    setProjectManagerSearch,
    divisionSearch,
    setDivisionSearch,
    projectManagerDropdownRef,
    divisionDropdownRef,
    projectList,
    summary,
    totalProjects,
    totalPages,
    selectedProjectManagerName,
    selectedDivisionName,
    filteredUsers: filterUsers(users, projectManagerSearch),
    filteredDivisions: filterDivisions(divisions, divisionSearch),
    hasActiveFilters,
    resetFilters,
    selectedProject,
    isFormOpen,
    isFormDirty,
    setIsFormDirty,
    projectToDelete,
    openCreateModal: () => {
      setSelectedProject(null);
      setIsFormDirty(false);
      setIsFormOpen(true);
    },
    openEditModal: (project) => {
      setSelectedProject(project);
      setIsFormDirty(false);
      setIsFormOpen(true);
    },
    requestCloseFormModal,
    closeFormModal,
    openDeleteModal: setProjectToDelete,
    closeDeleteModal: () => setProjectToDelete(null),
  };
};
