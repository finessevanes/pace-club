// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";

/**
 * @title ProofOfHuman
 * @notice Implementation of SelfVerificationRoot for women runners verification
 * @dev This contract stores personal information from verified users
 */
contract ProofOfHuman is SelfVerificationRoot {
    // Storage for verification results
    bool public verificationSuccessful;
    mapping(uint256 => bytes) public userDatas;
    mapping(uint256 => string) public names;
    mapping(uint256 => string) public nationalities;
    mapping(uint256 => string) public datesOfBirth;
    mapping(uint256 => string) public genders;
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;
    
    // Events for testing
    event PersonalDataStored(
        uint256 indexed userIdentifier,
        bytes userData,
        string name,
        string nationality,
        string dateOfBirth,
        string gender
    );

    /**
     * @notice Constructor for the contract
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     */
    constructor(
        address identityVerificationHubV2Address,
        uint256 scope,
        bytes32 _verificationConfigId
    ) SelfVerificationRoot(identityVerificationHubV2Address, scope) {
        verificationConfigId = _verificationConfigId;
    }
    
    /**
     * @notice Implementation of customVerificationHook
     * @dev This function is called by onVerificationSuccess after hub address validation
     * @param output The verification output from the hub
     * @param userData The user data passed through verification
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        verificationSuccessful = true;
        uint256 userId = output.userIdentifier;
        userDatas[userId] = userData;
        names[userId] = output.name.length > 0 ? output.name[0] : "";
        nationalities[userId] = output.nationality;
        datesOfBirth[userId] = output.dateOfBirth;
        genders[userId] = output.gender;

        emit PersonalDataStored(
            userId,
            userData,
            names[userId],
            nationalities[userId],
            datesOfBirth[userId],
            genders[userId]
        );
    }

    /**
     * @notice Reset the test state
     */
    function resetTestState() external {
        verificationSuccessful = false;
        // Optionally clear mappings for a specific user if needed, or leave as is for test purposes
    }

    /**
     * @notice Expose the internal _setScope function for testing
     * @param newScope The new scope value to set
     */
    function setScope(uint256 newScope) external {
        _setScope(newScope);
    }

    function setVerificationConfig(
        SelfStructs.VerificationConfigV2 memory config
    ) external {
        verificationConfig = config;
        _identityVerificationHubV2.setVerificationConfigV2(verificationConfig);
    }

    function setVerificationConfigNoHub(
        SelfStructs.VerificationConfigV2 memory config
    ) external {
        verificationConfig = config;
    }

    function setConfigId(bytes32 configId) external {
        verificationConfigId = configId;
    }

    function getConfigId(
        bytes32 destinationChainId,
        bytes32 userIdentifier,
        bytes memory userDefinedData
    ) public view override returns (bytes32) {
        return 0x7b6436b0c98f62380866d9432c2af0ee08ce16a171bda6951aecd95ee1307d61;
    }
}
