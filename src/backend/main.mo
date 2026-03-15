import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


 actor {
  let cows = Map.empty<Nat, Cow>();
  let calves = Map.empty<Nat, Calf>();
  let heatRecords = Map.empty<Nat, HeatRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextCowId = 0;
  var nextCalfId = 0;
  var nextHeatRecordId = 0;

  let accessControlState = AccessControl.initState();

  // Include storage mixin for blob storage
  include MixinStorage();
  include MixinAuthorization(accessControlState);

  public type Cow = {
    id : Nat;
    name : Text;
    breed : ?Text;
    photoUrl : ?Text;
    createdAt : Int;
    ownerId : Principal;
  };

  public type Calf = {
    id : Nat;
    name : Text;
    birthDate : Text;
    gender : Text; // "male" or "female"
    motherCowId : Nat;
    notes : ?Text;
    photoUrl : ?Text;
    createdAt : Int;
    ownerId : Principal;
  };

  public type HeatRecord = {
    id : Nat;
    cowId : Nat;
    date : Text;
    month : Text;
    notes : ?Text;
    createdAt : Int;
    ownerId : Principal;
  };

  public type UserProfile = {
    name : Text;
  };

  // Cow CRUD
  public shared ({ caller }) func addCow(name : Text, breed : ?Text, photoUrl : ?Text) : async Nat {
    checkUser(caller);

    let currentTime = Time.now();
    checkValidName(name);

    let cow = {
      id = nextCowId;
      name;
      breed;
      photoUrl;
      createdAt = currentTime;
      ownerId = caller;
    };

    cows.add(nextCowId, cow);
    nextCowId += 1;
    cow.id;
  };

  public query ({ caller }) func getMyCows() : async [Cow] {
    checkUser(caller);

    cows.values().toArray().filter(
      func(cow) { cow.ownerId == caller }
    );
  };

  public query ({ caller }) func getCow(id : Nat) : async Cow {
    let cow = getValidCow(id);
    checkOwnershipOrAdmin(caller, cow.ownerId);
    cow;
  };

  public shared ({ caller }) func updateCow(id : Nat, name : Text, breed : ?Text, photoUrl : ?Text) : async () {
    let cow = getValidCow(id);
    checkOwnershipOrAdmin(caller, cow.ownerId);

    checkValidName(name);

    let updatedCow = {
      id;
      name;
      breed;
      photoUrl;
      createdAt = cow.createdAt;
      ownerId = cow.ownerId;
    };
    cows.add(id, updatedCow);
  };

  public shared ({ caller }) func deleteCow(id : Nat) : async () {
    let cow = getValidCow(id);
    checkOwnershipOrAdmin(caller, cow.ownerId);
    cows.remove(id);
  };

  // Calf CRUD
  public shared ({ caller }) func addCalf(
    name : Text,
    birthDate : Text,
    gender : Text,
    motherCowId : Nat,
    notes : ?Text,
    photoUrl : ?Text,
  ) : async Nat {
    checkUser(caller);

    checkValidName(name);
    if (gender != "male" and gender != "female") {
      Runtime.trap("Gender must be 'male' or 'female'");
    };

    let motherCow = getValidCow(motherCowId);
    checkOwnershipOrAdmin(caller, motherCow.ownerId);

    let currentTime = Time.now();
    // Calf inherits ownership from mother cow, not from caller
    // This ensures consistent ownership even when admin creates calf
    let calf = {
      id = nextCalfId;
      name;
      birthDate;
      gender;
      motherCowId;
      notes;
      photoUrl;
      createdAt = currentTime;
      ownerId = motherCow.ownerId;
    };

    calves.add(nextCalfId, calf);
    nextCalfId += 1;
    calf.id;
  };

  public query ({ caller }) func getMyCalves() : async [Calf] {
    checkUser(caller);

    calves.values().toArray().filter(
      func(calf) { calf.ownerId == caller }
    );
  };

  public query ({ caller }) func getCalf(id : Nat) : async Calf {
    let calf = getValidCalf(id);
    checkOwnershipOrAdmin(caller, calf.ownerId);
    calf;
  };

  public shared ({ caller }) func updateCalf(
    id : Nat,
    name : Text,
    birthDate : Text,
    gender : Text,
    motherCowId : Nat,
    notes : ?Text,
    photoUrl : ?Text,
  ) : async () {
    let calf = getValidCalf(id);
    checkOwnershipOrAdmin(caller, calf.ownerId);

    checkValidName(name);
    if (gender != "male" and gender != "female") {
      Runtime.trap("Gender must be 'male' or 'female'");
    };

    let motherCow = getValidCow(motherCowId);
    // Verify caller has access to the new mother cow
    checkOwnershipOrAdmin(caller, motherCow.ownerId);

    let updatedCalf = {
      id;
      name;
      birthDate;
      gender;
      motherCowId;
      notes;
      photoUrl;
      createdAt = calf.createdAt;
      ownerId = calf.ownerId;
    };
    calves.add(id, updatedCalf);
  };

  public shared ({ caller }) func deleteCalf(id : Nat) : async () {
    let calf = getValidCalf(id);
    checkOwnershipOrAdmin(caller, calf.ownerId);
    calves.remove(id);
  };

  // HeatRecord CRUD
  public shared ({ caller }) func addHeatRecord(
    cowId : Nat,
    date : Text,
    month : Text,
    notes : ?Text,
  ) : async Nat {
    checkUser(caller);

    let cow = getValidCow(cowId);
    checkOwnershipOrAdmin(caller, cow.ownerId);

    checkValidMonth(month);

    let currentTime = Time.now();
    // Heat record inherits ownership from cow, not from caller
    // This ensures consistent ownership even when admin creates heat record
    let heatRecord = {
      id = nextHeatRecordId;
      cowId;
      date;
      month;
      notes;
      createdAt = currentTime;
      ownerId = cow.ownerId;
    };

    heatRecords.add(nextHeatRecordId, heatRecord);
    nextHeatRecordId += 1;
    heatRecord.id;
  };

  public query ({ caller }) func getCowHeatRecords(cowId : Nat) : async [HeatRecord] {
    checkUser(caller);
    let cow = getValidCow(cowId);
    checkOwnershipOrAdmin(caller, cow.ownerId);

    heatRecords.values().toArray().filter(
      func(record) { record.cowId == cowId }
    );
  };

  public query ({ caller }) func getMyHeatRecords() : async [HeatRecord] {
    checkUser(caller);

    heatRecords.values().toArray().filter(
      func(record) { record.ownerId == caller }
    );
  };

  public query ({ caller }) func getHeatRecord(id : Nat) : async HeatRecord {
    let record = getValidHeatRecord(id);
    checkOwnershipOrAdmin(caller, record.ownerId);
    record;
  };

  public shared ({ caller }) func updateHeatRecord(
    id : Nat,
    cowId : Nat,
    date : Text,
    month : Text,
    notes : ?Text,
  ) : async () {
    let record = getValidHeatRecord(id);
    checkOwnershipOrAdmin(caller, record.ownerId);

    let cow = getValidCow(cowId);
    // Verify caller has access to the new cow
    checkOwnershipOrAdmin(caller, cow.ownerId);
    
    checkValidMonth(month);

    let updatedRecord = {
      id;
      cowId;
      date;
      month;
      notes;
      createdAt = record.createdAt;
      ownerId = record.ownerId;
    };
    heatRecords.add(id, updatedRecord);
  };

  public shared ({ caller }) func deleteHeatRecord(id : Nat) : async () {
    let record = getValidHeatRecord(id);
    checkOwnershipOrAdmin(caller, record.ownerId);
    heatRecords.remove(id);
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    checkUser(caller);
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    checkUser(caller);
    userProfiles.add(caller, profile);
  };

  // Helper functions
  func getValidCow(id : Nat) : Cow {
    switch (cows.get(id)) {
      case (?cow) { cow };
      case (null) { Runtime.trap("Cow not found") };
    };
  };

  func getValidCalf(id : Nat) : Calf {
    switch (calves.get(id)) {
      case (?calf) { calf };
      case (null) { Runtime.trap("Calf not found") };
    };
  };

  func getValidHeatRecord(id : Nat) : HeatRecord {
    switch (heatRecords.get(id)) {
      case (?record) { record };
      case (null) { Runtime.trap("HeatRecord not found") };
    };
  };

  func checkOwnershipOrAdmin(caller : Principal, ownerId : Principal) {
    if (caller != ownerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only owner or admin can access data");
    };
  };

  func checkValidName(name : Text) {
    if (name.isEmpty() or name.size() > 50) {
      Runtime.trap("Name must be between 1 and 50 characters");
    };
  };

  func checkValidMonth(month : Text) {
    if (month.size() != 3) {
      Runtime.trap("Month must be exactly 3 characters long");
    };
  };

  func checkUser(caller : Principal) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can perform this action");
    };
  };
};
