import React from "react";
import { useNavigate } from "react-router-dom";

const ProjectDetailModal = ({ project, onClose }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    if (project?._id) {
      navigate(`/project-management/${project._id}`);
      if (onClose) onClose();
    }
  }, [project, navigate, onClose]);

  return null;
};

export default ProjectDetailModal;
