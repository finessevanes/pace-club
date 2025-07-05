// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title VibeProfile
 * @notice Contract for running crew matching with verified meetup rewards
 * @dev Built for Flow blockchain - rewards real-world running with Strava proof
 */
contract VibeProfile {
    
    // Enums for vibe types
    enum PaceType { Chill, Brisk, Stride, Sprint }
    enum VibeType { Zen, Energy, Focus, Beast }
    
    // Profile structure
    struct Profile {
        PaceType pacePreference;
        VibeType vibeType;
        string location;
        string timeSlot;
        string bio;
        bool isActive;
        uint256 reputation;
        uint256 points;
        uint256 createdAt;
    }
    
    // Meetup verification structure
    struct MeetupClaim {
        address runner1;
        address runner2;
        string stravaActivityId1;
        string stravaActivityId2;
        uint256 claimedAt;
        bool verified;
        bool rewarded;
    }
    
    // Storage
    mapping(address => Profile) public profiles;
    mapping(address => bool) public hasProfile;
    address[] public activeUsers;
    
    // Connection tracking
    mapping(address => mapping(address => bool)) public hasConnected;
    mapping(address => address[]) public userConnections;
    mapping(address => uint256) public connectionCount;
    
    // Meetup tracking
    mapping(bytes32 => MeetupClaim) public meetupClaims;
    mapping(address => uint256) public meetupCount;
    mapping(string => bool) public usedStravaActivities; // Prevent reusing same activity
    bytes32[] public pendingMeetups;
    
    // Points configuration
    uint256 public constant POINTS_PER_CONNECTION = 10;
    uint256 public constant POINTS_PROFILE_CREATION = 25;
    uint256 public constant POINTS_PER_MEETUP = 50;           // BIG reward for real meetups!
    uint256 public constant POINTS_STREAK_BONUS = 25;        // Bonus for multiple meetups
    
    // Meetup verification settings
    uint256 public constant MAX_TIME_DIFF = 3600;            // 1 hour difference allowed
    uint256 public constant VERIFICATION_WINDOW = 7 days;    // Must verify within 7 days
    
    // Events
    event ProfileCreated(address indexed user, PaceType pace, VibeType vibe, string location);
    event ProfileUpdated(address indexed user, PaceType pace, VibeType vibe);
    event ReputationUpdated(address indexed user, uint256 newReputation);
    event ConnectionMade(address indexed user1, address indexed user2, uint256 pointsAwarded);
    event PointsAwarded(address indexed user, uint256 points, string reason);
    event MeetupClaimed(bytes32 indexed meetupId, address indexed runner1, address indexed runner2);
    event MeetupVerified(bytes32 indexed meetupId, address indexed runner1, address indexed runner2, uint256 pointsAwarded);
    
    /**
     * @notice Create or update user profile
     */
    function createProfile(
        PaceType _pacePreference,
        VibeType _vibeType,
        string memory _location,
        string memory _timeSlot,
        string memory _bio
    ) external {
        bool isNewProfile = !hasProfile[msg.sender];
        
        profiles[msg.sender] = Profile({
            pacePreference: _pacePreference,
            vibeType: _vibeType,
            location: _location,
            timeSlot: _timeSlot,
            bio: _bio,
            isActive: true,
            reputation: isNewProfile ? 100 : profiles[msg.sender].reputation,
            points: isNewProfile ? POINTS_PROFILE_CREATION : profiles[msg.sender].points,
            createdAt: isNewProfile ? block.timestamp : profiles[msg.sender].createdAt
        });
        
        if (isNewProfile) {
            hasProfile[msg.sender] = true;
            activeUsers.push(msg.sender);
            emit ProfileCreated(msg.sender, _pacePreference, _vibeType, _location);
            emit PointsAwarded(msg.sender, POINTS_PROFILE_CREATION, "Profile creation");
        } else {
            emit ProfileUpdated(msg.sender, _pacePreference, _vibeType);
        }
    }
    
    /**
     * @notice Connect with another runner and earn points
     */
    function connectWithRunner(address _otherUser) external {
        require(hasProfile[msg.sender], "You must have a profile to connect");
        require(hasProfile[_otherUser], "Other user must have a profile");
        require(msg.sender != _otherUser, "Cannot connect with yourself");
        require(!hasConnected[msg.sender][_otherUser], "Already connected with this user");
        
        // Mark connection (bidirectional)
        hasConnected[msg.sender][_otherUser] = true;
        hasConnected[_otherUser][msg.sender] = true;
        
        // Add to connections list
        userConnections[msg.sender].push(_otherUser);
        userConnections[_otherUser].push(msg.sender);
        
        // Update connection counts
        connectionCount[msg.sender]++;
        connectionCount[_otherUser]++;
        
        // Award points to both users
        profiles[msg.sender].points += POINTS_PER_CONNECTION;
        profiles[_otherUser].points += POINTS_PER_CONNECTION;
        
        emit ConnectionMade(msg.sender, _otherUser, POINTS_PER_CONNECTION);
        emit PointsAwarded(msg.sender, POINTS_PER_CONNECTION, "New connection");
        emit PointsAwarded(_otherUser, POINTS_PER_CONNECTION, "New connection");
    }
    
    /**
     * @notice Claim meetup rewards with Strava proof
     * @param _otherRunner Address of the other runner
     * @param _myStravaActivityId Your Strava activity ID
     * @param _otherStravaActivityId Other runner's Strava activity ID
     */
    function claimMeetupReward(
        address _otherRunner,
        string memory _myStravaActivityId,
        string memory _otherStravaActivityId
    ) external {
        require(hasProfile[msg.sender], "You must have a profile");
        require(hasProfile[_otherRunner], "Other runner must have a profile");
        require(hasConnected[msg.sender][_otherRunner], "You must be connected first");
        require(!usedStravaActivities[_myStravaActivityId], "Your Strava activity already used");
        require(!usedStravaActivities[_otherStravaActivityId], "Other Strava activity already used");
        
        // Create unique meetup ID
        bytes32 meetupId = keccak256(abi.encodePacked(
            msg.sender, 
            _otherRunner, 
            _myStravaActivityId, 
            _otherStravaActivityId,
            block.timestamp
        ));
        
        // Mark activities as used
        usedStravaActivities[_myStravaActivityId] = true;
        usedStravaActivities[_otherStravaActivityId] = true;
        
        // Create meetup claim
        meetupClaims[meetupId] = MeetupClaim({
            runner1: msg.sender,
            runner2: _otherRunner,
            stravaActivityId1: _myStravaActivityId,
            stravaActivityId2: _otherStravaActivityId,
            claimedAt: block.timestamp,
            verified: false,
            rewarded: false
        });
        
        pendingMeetups.push(meetupId);
        
        emit MeetupClaimed(meetupId, msg.sender, _otherRunner);
        
        // For hackathon demo: Auto-verify (in production, this would be done by oracle)
        _verifyMeetup(meetupId);
    }
    
    /**
     * @notice Verify meetup and award points (in production, this would be called by oracle)
     * @param _meetupId The meetup ID to verify
     */
    function _verifyMeetup(bytes32 _meetupId) internal {
        MeetupClaim storage claim = meetupClaims[_meetupId];
        require(claim.runner1 != address(0), "Meetup claim does not exist");
        require(!claim.verified, "Meetup already verified");
        require(block.timestamp <= claim.claimedAt + VERIFICATION_WINDOW, "Verification window expired");
        
        // In production, here we would:
        // 1. Call Strava API to get activity details
        // 2. Verify activities happened within MAX_TIME_DIFF
        // 3. Check GPS overlap or similar location/time
        // 4. Validate activity types are "Run"
        
        // For hackathon: Auto-approve all claims
        claim.verified = true;
        
        // Award points to both runners
        uint256 basePoints = POINTS_PER_MEETUP;
        uint256 bonusPoints = 0;
        
        // Streak bonus for frequent meetup participants
        if (meetupCount[claim.runner1] >= 2) bonusPoints += POINTS_STREAK_BONUS;
        if (meetupCount[claim.runner2] >= 2) bonusPoints += POINTS_STREAK_BONUS;
        
        uint256 totalPoints = basePoints + bonusPoints;
        
        profiles[claim.runner1].points += totalPoints;
        profiles[claim.runner2].points += totalPoints;
        
        // Update meetup counts
        meetupCount[claim.runner1]++;
        meetupCount[claim.runner2]++;
        
        claim.rewarded = true;
        
        emit MeetupVerified(_meetupId, claim.runner1, claim.runner2, totalPoints);
        emit PointsAwarded(claim.runner1, totalPoints, "Verified meetup");
        emit PointsAwarded(claim.runner2, totalPoints, "Verified meetup");
    }
    
    /**
     * @notice Get user's meetup history
     * @param _user Address to look up
     * @return Array of meetup IDs
     */
    function getUserMeetups(address _user) external view returns (bytes32[] memory) {
        bytes32[] memory userMeetups = new bytes32[](meetupCount[_user]);
        uint256 index = 0;
        
        for (uint256 i = 0; i < pendingMeetups.length; i++) {
            bytes32 meetupId = pendingMeetups[i];
            MeetupClaim storage claim = meetupClaims[meetupId];
            
            if (claim.runner1 == _user || claim.runner2 == _user) {
                if (index < userMeetups.length) {
                    userMeetups[index] = meetupId;
                    index++;
                }
            }
        }
        
        return userMeetups;
    }
    
    /**
     * @notice Get meetup details
     * @param _meetupId Meetup ID to look up
     * @return MeetupClaim struct
     */
    function getMeetupDetails(bytes32 _meetupId) external view returns (MeetupClaim memory) {
        return meetupClaims[_meetupId];
    }
    
    /**
     * @notice Get user profile
     * @param _user Address to look up
     * @return Profile struct
     */
    function getProfile(address _user) external view returns (Profile memory) {
        require(hasProfile[_user], "Profile does not exist");
        return profiles[_user];
    }
    
    /**
     * @notice Get user's connections
     * @param _user Address to look up
     * @return Array of connected user addresses
     */
    function getUserConnections(address _user) external view returns (address[] memory) {
        require(hasProfile[_user], "Profile does not exist");
        return userConnections[_user];
    }
    
    /**
     * @notice Get user's points
     * @param _user Address to look up
     * @return Points balance
     */
    function getUserPoints(address _user) external view returns (uint256) {
        require(hasProfile[_user], "Profile does not exist");
        return profiles[_user].points;
    }
    
    /**
     * @notice Get leaderboard (top point earners)
     * @param _limit Number of top users to return
     * @return Arrays of addresses and points
     */
    function getLeaderboard(uint256 _limit) external view returns (address[] memory, uint256[] memory) {
        uint256 totalUsers = activeUsers.length;
        uint256 returnSize = _limit > totalUsers ? totalUsers : _limit;
        
        address[] memory topUsers = new address[](returnSize);
        uint256[] memory topPoints = new uint256[](returnSize);
        
        for (uint256 i = 0; i < returnSize; i++) {
            uint256 maxPoints = 0;
            address maxUser = address(0);
            
            for (uint256 j = 0; j < totalUsers; j++) {
                address user = activeUsers[j];
                if (profiles[user].points > maxPoints) {
                    bool alreadyAdded = false;
                    for (uint256 k = 0; k < i; k++) {
                        if (topUsers[k] == user) {
                            alreadyAdded = true;
                            break;
                        }
                    }
                    if (!alreadyAdded) {
                        maxPoints = profiles[user].points;
                        maxUser = user;
                    }
                }
            }
            
            if (maxUser != address(0)) {
                topUsers[i] = maxUser;
                topPoints[i] = maxPoints;
            }
        }
        
        return (topUsers, topPoints);
    }
    
    /**
     * @notice Update reputation (for future crew matching rewards)
     * @param _user User to update
     * @param _newReputation New reputation score
     */
    function updateReputation(address _user, uint256 _newReputation) external {
        require(hasProfile[_user], "Profile does not exist");
        profiles[_user].reputation = _newReputation;
        emit ReputationUpdated(_user, _newReputation);
    }
    
    /**
     * @notice Get all active users (for basic matching)
     * @return Array of active user addresses
     */
    function getActiveUsers() external view returns (address[] memory) {
        return activeUsers;
    }
    
    /**
     * @notice Get total number of profiles
     * @return Total count
     */
    function getTotalProfiles() external view returns (uint256) {
        return activeUsers.length;
    }
    
    /**
     * @notice Check if user has profile
     * @param _user Address to check
     * @return Boolean indicating if profile exists
     */
    function userHasProfile(address _user) external view returns (bool) {
        return hasProfile[_user];
    }
    
    /**
     * @notice Check if two users are connected
     * @param _user1 First user address
     * @param _user2 Second user address
     * @return Boolean indicating if they're connected
     */
    function areUsersConnected(address _user1, address _user2) external view returns (bool) {
        return hasConnected[_user1][_user2];
    }
} 