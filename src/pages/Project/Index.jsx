import { useNavigate } from "react-router-dom";
import ProjectFilters from "./components/ProjectFilters";
import ProjectListHeader from "./components/ProjectListHeader";
import {
  DeleteProjectModal,
  ProjectFormModal,
} from "./components/ProjectModals";
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
    <div className="min-h-screen bg-slate-50/70 px-4 py-6 font-sans text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <ProjectListHeader
          summary={summary}
          onCreateProject={openCreateModal}
        />
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
    </div>
  );
};

export default IndexProject;
