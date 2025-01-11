import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardPage.module.css';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import RightPanel from './RightPanel';

const DashboardPage = () => {
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		// Fetch data from the protected route
		fetch('http://localhost:5000/protected', {
			method: 'POST',
			credentials: 'include',
			withCredentials: true, // Include cookies in the request
		})
			.then((response) => {
				if (!response.ok) {
					if (response.status === 401) {
						navigate('/session-timeout');
					}
					else {
						throw new Error('Failed to fetch data');
					}
				}
				return response.json();
			})
			.then((data) => {
				console.log(data);
				setData(data);
			})
			.catch((error) => {
				console.log(error);
				setError(error.message)
			});
	}, []);

	if (!data) {
		return <div>Loading...</div>; // Show loading message if data is still being fetched
	}

	return (
		<div className={styles.dashboardContainer}>
			<Sidebar setData={setData} userData={data} />
			<MainContent userName={data.username} />
		</div>
	);
};

export default DashboardPage;
