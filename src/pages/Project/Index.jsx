import { useNavigate } from "react-router-dom";
import ProjectFilters from "./components/ProjectFilters";
import ProjectListHeader from "./components/ProjectListHeader";
import {
  DeleteProjectModal,
  ProjectFormModal,
} from "./components/ProjectModals";
import ProjectTable, { ColumnHeaderBar } from "./components/ProjectTable";
import { useProjectListPage } from "./hooks/useProjectListPage";
import { getProjectById } from "../../services/project";
import { useQueryClient } from "@tanstack/react-query";

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

  const queryClient = useQueryClient();

  const prefetchProjectDetail = (project) => {
    queryClient.prefetchQuery({
      queryKey: ["project", project._id],
      queryFn: () => getProjectById(project._id),
      staleTime: 30 * 1000,
    });
  };

  const openProjectDetail = (project) => {
    navigate(`/project-management/${project._id}`);
  };

  const openProjectTasks = (project) => {
    navigate(`/project/${project._id}`);
  };

  const confirmProjectDeletion = () => {
    if (!projectToDelete) return;

    deleteProjectMutation.mutate(projectToDelete._id, {
      onSuccess: closeDeleteModal,
    });
  };

  return (
    <div className="min-h-screen bg-white/20 font-sans rounded-sm text-white flex flex-col">
      <div className="sticky top-0 z-30 bg-[#1A3D64]/90 pt-6 pb-2 rounded-sm">
        <div className="mx-auto max-w-[1440px] space-y-5 px-6">
          <ProjectListHeader
            summary={summary}
            onCreateProject={openCreateModal}
          />
          <ProjectFilters state={projectListPage} />
        </div>
        <div className="mx-auto max-w-[1440px] px-6 mt-4">
          <ColumnHeaderBar />
        </div>
      </div>

      <div className="flex-1 mx-auto max-w-[1440px] w-full p-6 pt-4">
        <ProjectTable
          query={projectQuery}
          projects={projectList}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
          onCreateProject={openCreateModal}
          onViewProject={openProjectDetail}
          onOpenProject={openProjectTasks}
          onPrefetchDetail={prefetchProjectDetail}
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
