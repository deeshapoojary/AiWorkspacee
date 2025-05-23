import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Sidebar.module.css';
import { FaFolder, FaFolderOpen, FaFileAlt, FaEllipsisH, FaUser, FaTasks, FaPlus, FaSignOutAlt } from 'react-icons/fa';


const Sidebar = ({ setData, userData }) => {
  const owner = userData.email;
  const userName = userData.username;
  const [yourTeams, setYourTeams] = useState([]);
  const navigate = useNavigate();
  const [memberTeams, setMemberTeams] = useState([]); // Teams user is a member of
  const [expanded, setExpanded] = useState({ yourTeams: true, teams: true });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createContext, setCreateContext] = useState({ parentId: null, type: 'folder' });
  const [showOptionsFor, setShowOptionsFor] = useState(null);
  const [projMembers, setProjMembers] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/teams/fetchTeams`, {
          owner,
        });

        if (response.data) {
          setYourTeams(response.data.teams);
          setMemberTeams(response.data.memberTeams);
        } else {
          console.log('No teams found');
        }
      } catch (error) {
        console.log(error.response?.data?.message || 'Something went wrong, try again.');
      }
    };

    fetchTeams();
  }, []);

  if (!yourTeams || !memberTeams) {
    return <div>Loading...</div>; // Show loading message if data is still being fetched
  }

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      localStorage.removeItem('authToken');
      setData(null);
      alert('Logged out successfully!');
      navigate('/signin');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Logout failed. Please try again.');
    }
  };

  const toggleExpand = (key) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateTeam = () => {
    setCreateContext({ parentId: null, type: 'folder' });
    setShowCreateModal(true);
  };

  const handleTeamSubmit = async (teamName) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/teams/createTeam`, {
        teamName,
        owner,
        ownerName: userName
      },
        {
          withCredentials: true
        });

      if (response.data) {
        setShowCreateModal(false);
        setYourTeams((prev) => [...prev, response.data.savedTeam]);
        alert('Team created successfully!');
      } else {
        console.log('Team not created');
      }
    } catch (error) {
      console.log(error.response?.data?.message || 'Something went wrong, try again.');
    }
  }

  const handleCreateProject = (teamId, teamMembers) => {
    setProjMembers(teamMembers);
    setCreateContext({ parentId: teamId, type: 'file' });
    setShowCreateModal(true);
  };

  const handleSubmitProject = async (projName, teamId) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/projects/createProject`, {
        projName: projName,
        teamId,
        owner,
        ownerName: userName,
        members: projMembers,
      },
        {
          withCredentials: true
        });

      if (response.data) {
        setShowCreateModal(false);
        alert('Project created successfully!');
      } else {
        console.log('Project not created');
      }
    }
    catch (error) {
      console.log(error.response?.data?.message || 'Something went wrong while creating project, try again.');
    }
  }

  const renderProject = (project) => (
    <div className={styles.nodeContainer} key={project.id}>
      <div className={styles.nodeHeader}>
        <div className={styles.nodeInfo}>
          <FaFileAlt />
          <span className={styles.nodeName}>{project.name}</span>
        </div>
      </div>
    </div>
  );

  const renderTeam = (team) => {
    const isTeamExpanded = expanded[team._id] !== false;

    return (
      <div className={styles.nodeContainer} key={team.id}>
        <div className={styles.nodeHeader}>
          <a
            href={`/teams/${team._id}`} // Use href for navigation
            className={styles.nodeInfo}
          >
            {isTeamExpanded ? <FaFolderOpen /> : <FaFolder />}
            <span className={styles.nodeName}>{team.teamName}</span>
          </a>
          <button className={styles.optionsBtn} onClick={() => setShowOptionsFor(team._id)}>
            <FaEllipsisH />
          </button>
          {showOptionsFor === team._id && (
            <div className={styles.optionsMenu}>
              <div
                className={styles.optionsMenuItem}
                onClick={() => handleCreateProject(team._id, team.members)}
              >
                Add Project
              </div>
            </div>
          )}
        </div>
        {isTeamExpanded && team.children && (
          <div className={styles.children}>
            {team.children.map(renderProject)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.sidebar}>
      {/* Your Teams */}
      <div className={styles.nodeContainer}>
        <div className={styles.nodeHeader}>
          <div className={styles.nodeInfo} onClick={() => toggleExpand('yourTeams')}>
            {expanded.yourTeams ? <FaFolderOpen /> : <FaFolder />}
            <span className={styles.nodeName}>Your Teams</span>
          </div>
          <button className={styles.optionsBtn} onClick={handleCreateTeam}>
            <FaPlus />
          </button>
        </div>
        {expanded.yourTeams && (
          <div className={styles.children}>
            {yourTeams.map((team) => renderTeam(team))}
          </div>
        )}
      </div>

      {/* Member Teams */}
      <div className={styles.nodeContainer}>
        <div className={styles.nodeHeader}>
          <div className={styles.nodeInfo} onClick={() => toggleExpand('teams')}>
            {expanded.teams ? <FaFolderOpen /> : <FaFolder />}
            <span className={styles.nodeName}>Teams</span>
          </div>
        </div>
        {expanded.teams && memberTeams.length > 0 && (
          <div className={styles.children}>
            {memberTeams.map((team) => renderTeam(team))}
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className={styles.nodeContainer}>
        <div className={styles.nodeHeader}>
          <a href="/mytask" className={styles.nodeLink}> {/* Use <a> for redirection */}
            <div className={styles.nodeInfo}>
              <FaTasks />
              <span className={styles.nodeName}>Tasks</span>
            </div>
          </a>
        </div>
      </div>

      {/* Profile */}
      <div className={styles.nodeContainer}>
        <div className={styles.nodeHeader}>
          <a href="/profile" className={styles.nodeLink}>
            <div className={styles.nodeInfo}>
              <FaUser />
              <span className={styles.nodeName}>Profile</span>
            </div>
          </a>
        </div>
      </div>

      {/* Signout */}
      <div className={styles.nodeContainer}>
        <div className={styles.nodeHeader}>
          <div className={styles.nodeInfo}>
            <FaSignOutAlt />
            <span
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }} className={styles.nodeName}>Signout</span>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <h2>Create New {createContext.type === 'folder' ? 'Team' : 'Project'}</h2>
            <input
              type="text"
              className={styles.modalInput}
              placeholder={
                createContext.type === 'folder' ? 'Team Name' : 'Project Name'
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const name = e.target.value.trim();
                  if (!name) return;
                  const id = `${createContext.type}_${Date.now()}`;
                  const newItem = { type: createContext.type, name, id };
                  if (createContext.type === 'folder') {
                    newItem.children = [];
                    handleTeamSubmit(name);
                  }
                  else {
                    handleSubmitProject(name, createContext.parentId);
                  }
                }
              }}
            />
            <button
              className={styles.submitBtn}
              onClick={() => {
                const input = document.querySelector(`.${styles.modalInput}`);
                const name = input.value.trim();
                if (!name) return;
                const id = `${createContext.type}_${Date.now()}`;
                const newItem = { type: createContext.type, name, id };
                if (createContext.type === 'folder') {
                  newItem.children = [];
                  handleTeamSubmit(name);
                }
                else {
                  handleSubmitProject(name, createContext.parentId);
                }
              }}
            >
              Create
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
