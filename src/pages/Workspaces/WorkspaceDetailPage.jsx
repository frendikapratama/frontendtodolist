import { useParams } from "react-router-dom";
import { useWorkspace } from "../../hook/useWorkspace";
import { useEffect, useState } from "react";
import { useSelectedWorkspace } from "../../context/WorkspaceContext";
import CollaborationTab from "./CollaborationTab";

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

      <div className="card p-3">
        <div className="flex flex-row justify-between items-center mb-4">
          <h2 className="card-title text-[1.2em]">Workspace {data.nama}</h2>
          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              document.getElementById("addProjectModal").showModal()
            }
          >
            Tambah Project
          </button>
        </div>

        <CollaborationTab workspaceId={id} />
      </div>
    </>
  );
};

export default WorkspaceDetailPage;
