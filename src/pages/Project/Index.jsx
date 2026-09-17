import { useNavigate } from "react-router-dom";
import ProjectFilters from "./components/ProjectFilters";
import ProjectListHeader from "./components/ProjectListHeader";
import { DeleteProjectModal, ProjectFormModal } from "./components/ProjectModals";
import ProjectTable from "./components/ProjectTable";
import { useProjectListPage } from "./hooks/useProjectListPage";

const IndexProject = () => {
  const navigate = useNavigate();
  const projectListPage = useProjectListPage();
  const {
    projectQuery,
    deleteProjectMutation,
    projectList,
    summary,
    totalProjects,
    totalPages,
    hasActiveFilters,
    resetFilters,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    selectedProject,
    isFormOpen,
    requestCloseFormModal,
    closeFormModal,
    setIsFormDirty,
    projectToDelete,
    closeDeleteModal,
    limit,
    setLimit,
    page,
    setPage,
  } = projectListPage;

  const openProjectDetail = (project) => {
    navigate(`/project-management/${project._id}`);
  };

  const confirmProjectDeletion = () => {
    if (!projectToDelete) return;

    deleteProjectMutation.mutate(projectToDelete._id, {
      onSuccess: closeDeleteModal,
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      <ProjectListHeader summary={summary} onCreateProject={openCreateModal} />
      <ProjectFilters state={projectListPage} />
      <ProjectTable
        query={projectQuery}
        projects={projectList}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetFilters}
        onCreateProject={openCreateModal}
        onViewProject={openProjectDetail}
        onEditProject={openEditModal}
        onDeleteProject={openDeleteModal}
        totalProjects={totalProjects}
        limit={limit}
        setLimit={setLimit}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />
      <ProjectFormModal
        isOpen={isFormOpen}
        project={selectedProject}
        onCloseRequest={requestCloseFormModal}
        onClose={closeFormModal}
        onDirtyChange={setIsFormDirty}
      />
      <DeleteProjectModal
        project={projectToDelete}
        isDeleting={deleteProjectMutation.isPending}
        onClose={closeDeleteModal}
        onConfirm={confirmProjectDeletion}
      />
    </div>
  );
};

export default IndexProject;
