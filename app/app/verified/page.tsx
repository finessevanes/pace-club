"use client";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
// @ts-ignore
import abi from "../abi/ProofOfHuman.abi.json";
import Image from "next/image";
import styles from "./page.module.css";
import skeleton from "./skeleton.gif";

export default function VerifiedPage() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [userData, setUserData] = useState<{
		lastUser: string;
		name: string;
		dateOfBirth: string;
		nationality: string;
		gender: string;
	} | null>(null);

	useEffect(() => {
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
				// Hardcoded user identifier (address as uint256)
				const userIdentifier = "0x0000000000000000000000000000000000000000";
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
	}, []);

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

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 overflow-hidden p-4">
				<div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading verification data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 overflow-hidden p-4">
				<div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold text-red-600 mb-4">❌ Error</h1>
						<p className="text-gray-600">{error}</p>
					</div>
					<button
						onClick={() => window.location.href = '/'}
						className="w-full bg-gray-800 hover:bg-gray-700 transition-colors text-white py-3 px-6 rounded-lg font-medium"
					>
						Go Back Home
					</button>
				</div>
			</div>
		);
	}

	if (!userData) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 overflow-hidden p-4">
				<div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
					<div className="text-center mb-8">
						<h1 className="text-2xl font-bold text-red-600 mb-4">❌ Error</h1>
						<p className="text-gray-600">No verification data found.</p>
					</div>
					<button
						onClick={() => window.location.href = '/'}
						className="w-full bg-gray-800 hover:bg-gray-700 transition-colors text-white py-3 px-6 rounded-lg font-medium"
					>
						Go Back Home
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 overflow-hidden p-4">
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
				</div>
			</div>
		</div>
	);
}
