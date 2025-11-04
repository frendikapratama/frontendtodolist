import { useParams } from "react-router-dom";
import { useWorkspace } from "../../hook/useWorkspace";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelectedWorkspace } from "../../context/WorkspaceContext";
const WorkspaceDetailPage = () => {
  const { WorkspaceDetail, addProjectMutation } = useWorkspace();

  const { id } = useParams();
  const workspaceQuery = WorkspaceDetail(id);
  const { data, isLoading, isError } = workspaceQuery;
  const [projectName, setProjectName] = useState("");
  const { setSelectedWorkspaceId } = useSelectedWorkspace();

  useEffect(() => {
    if (id) {
      setSelectedWorkspaceId(id);
    }
  }, [id, setSelectedWorkspaceId]);

  const navigate = useNavigate();

  const handleAddProject = (e) => {
    e.preventDefault();
    addProjectMutation.mutate({
      workspaceId: id,
      data: { nama: projectName },
    });
    setProjectName("");
    document.getElementById("addProjectModal").close();
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Gagal memuat data</p>;

  return (
    <>
      <dialog id="addProjectModal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Tambah Project</h3>
          <form onSubmit={handleAddProject}>
            <input
              type="text"
              placeholder="Nama Project"
              className="input input-bordered w-full"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
            <div className="modal-action">
              <button type="submit" className="btn btn-primary">
                Simpan
              </button>
              <button
                type="button"
                className="btn"
                onClick={() =>
                  document.getElementById("addProjectModal").close()
                }
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </dialog>
      <div className="card  p-6">
        <div className="flex flex-row justify-between">
          <h2 className="card-title text-2xl mb-4">Workspaces {data.nama}</h2>
          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              document.getElementById("addProjectModal").showModal()
            }
          >
            Tambah Project
          </button>
        </div>

        <h3 className="font-semibold mb-4">Daftar Project:</h3>
        {data.projects?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.projects.map((project) => (
              <div
                key={project._id}
                className="card bg-base-100 shadow-md p-4 cursor-pointer"
                onClick={() => navigate(`/project/${project._id}`)}
              >
                <h4 className="card-title text-lg">{project.nama}</h4>
                <div className="card-actions justify-end"></div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Belum ada project</p>
        )}
      </div>
    </>
  );
};

export default WorkspaceDetailPage;
