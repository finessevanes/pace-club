"use client";

import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
// @ts-ignore
import abi from "../abi/ProofOfHuman.abi.json";
import Image from "next/image";
import styles from "./page.module.css";
import skeleton from "./skeleton.gif";

export default function VerifiedPage() {
	const { ready, authenticated, user } = usePrivy();
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [userData, setUserData] = useState<{
		lastUser: string;
		name: string;
		dateOfBirth: string;
		nationality: string;
		gender: string;
	} | null>(null);
	const [stravaAthlete, setStravaAthlete] = useState<any | null>(null);

	// Get wallet address from Privy
	const walletAddress = user?.wallet?.address;

	useEffect(() => {
		if (!ready || !authenticated || !walletAddress) return;
		async function fetchContractData() {
			setLoading(true);
			setError(null);
			try {
				const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_CELO_RPC_URL || "");
				const contract = new ethers.Contract(
					process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
					abi,
					provider
				);
				// Use wallet address as userIdentifier
				const userIdentifier = walletAddress || "";
				const name = await contract.names(userIdentifier);
				const dateOfBirth = await contract.datesOfBirth(userIdentifier);
				const nationality = await contract.nationalities(userIdentifier);
				const gender = await contract.genders(userIdentifier);
				setUserData({ lastUser: userIdentifier, name, dateOfBirth, nationality, gender });
			} catch (err: any) {
				setError("Failed to fetch contract data");
			} finally {
				setLoading(false);
			}
		}
		fetchContractData();

		// Load Strava athlete from localStorage
		if (typeof window !== 'undefined') {
			const athlete = localStorage.getItem("stravaAthlete");
			if (athlete) setStravaAthlete(JSON.parse(athlete));
		}
	}, [ready, authenticated, walletAddress]);

	const formatAddress = (address: string) => {
		if (!address) return 'N/A';
		return `${address.slice(0, 6)}...${address.slice(-4)}`;
	};

	const getGenderDisplay = (gender: string) => {
		switch (gender.toLowerCase()) {
			case 'f':
			case 'female':
				return '👩 Female';
			case 'm':
			case 'male':
				return '👨 Male';
			default:
				return gender;
		}
	};

	const calculateAge = (dateOfBirth: string) => {
		if (!dateOfBirth) return 'N/A';
		const today = new Date();
		const birthDate = new Date(dateOfBirth);
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		return age.toString();
	};

	if (!ready || !authenticated || !walletAddress) {
		return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">Loading...</div>;
	}
	if (loading) {
		return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">Loading verification data...</div>;
	}
	if (error) {
		return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-red-600">{error}</div>;
	}
	if (!userData) {
		return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">No verification data found.</div>;
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 overflow-hidden p-4">
			{/* Strava Trading Card */}
			{stravaAthlete && (
				<div className="bg-orange-50 border border-orange-200 rounded-xl shadow-md p-6 mb-8 flex flex-col items-center max-w-md w-full">
					<img
						src={stravaAthlete.profile}
						alt="Strava profile"
						className="rounded-full border-4 border-orange-300 mb-4"
						width={120}
						height={120}
					/>
					<h2 className="text-2xl font-bold text-orange-700 mb-1">{stravaAthlete.firstname} {stravaAthlete.lastname}</h2>
					<p className="text-orange-600 mb-2">@{stravaAthlete.username}</p>
					<p className="text-gray-700 mb-1">{stravaAthlete.city}{stravaAthlete.state ? `, ${stravaAthlete.state}` : ""}</p>
					<a
						href={`https://www.strava.com/athletes/${stravaAthlete.id}`}
						target="_blank"
						rel="noopener noreferrer"
						className="text-orange-500 underline text-sm mt-2"
					>
						View Strava Profile
					</a>
				</div>
			)}
			<div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
				<div className="text-center mb-8">
					<h1 className={styles.rotatingTitle}>Identity Verified!</h1>
				</div>

				<div className="text-center mb-8">
					<Image
						src={skeleton}
						alt="Loading animation"
						width={200}
						height={200}
						priority
					/>
				</div>

				<div className="space-y-6">
					<div className="bg-green-50 border border-green-200 rounded-lg p-6">
						<h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">👤 Personal Information</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="bg-white p-4 rounded-lg border border-green-100">
								<div className="text-sm text-green-600 font-medium mb-1">Name</div>
								<div className="text-lg font-semibold text-gray-800">{userData.name || 'N/A'}</div>
							</div>
							<div className="bg-white p-4 rounded-lg border border-green-100">
								<div className="text-sm text-green-600 font-medium mb-1">Date of Birth</div>
								<div className="text-lg font-semibold text-gray-800">{userData.dateOfBirth || 'N/A'}</div>
							</div>
							<div className="bg-white p-4 rounded-lg border border-green-100">
								<div className="text-sm text-green-600 font-medium mb-1">Nationality</div>
								<div className="text-lg font-semibold text-gray-800">{userData.nationality || 'N/A'}</div>
							</div>
							<div className="bg-white p-4 rounded-lg border border-green-100">
								<div className="text-sm text-green-600 font-medium mb-1">Gender</div>
								<div className="text-lg font-semibold text-gray-800">{getGenderDisplay(userData.gender)}</div>
							</div>
						</div>
					</div>

					<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
						<h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">🔗 User Address</h3>
						<div className="text-sm font-mono text-gray-700 break-all">{userData.lastUser}</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 pt-4">
						<button
							onClick={() => window.location.href = '/'}
							className="flex-1 bg-gray-800 hover:bg-gray-700 transition-colors text-white py-3 px-6 rounded-lg font-medium"
						>
							Verify Another Identity
						</button>
						<button
							onClick={() => window.open(`https://alfajores.celoscan.io/address/${userData.lastUser}`, '_blank')}
							className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white py-3 px-6 rounded-lg font-medium"
						>
							View Contract
						</button>
					</div>
					{/* Strava Connect Button */}
					<div className="flex flex-col gap-4 pt-4">
						<button
							onClick={() => window.location.href = '/api/strava/login'}
							className="bg-orange-500 hover:bg-orange-400 transition-colors text-white py-3 px-6 rounded-lg font-medium w-full"
						>
							🏃‍♂️ Connect Strava
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
