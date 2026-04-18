import {
  createHome,
  addAppliances,
  getHome,
  updateAppliance,
  deleteAppliance,
  addRoom,
  updateRoom,
  deleteRoom,
  HomeNotFoundError,
  RoomNotFoundError,
  ApplianceNotFoundError,
} from '../../src/services/home-service';

describe('home-service', () => {
  describe('createHome', () => {
    it('persists a home with the given rooms', async () => {
      const home = await createHome([
        { name: 'Living Room', type: 'living_room', size: 'medium' },
        { name: 'Bedroom', type: 'bedroom', size: 'small' },
      ]);

      expect(home.homeId).toBeDefined();
      expect(home.rooms).toHaveLength(2);
      expect(home.rooms[0]!.appliances).toEqual([]);
    });
  });

  describe('getHome', () => {
    it('returns null for an unknown homeId', async () => {
      const home = await getHome('does-not-exist');
      expect(home).toBeNull();
    });

    it('returns the home with its rooms and appliances', async () => {
      const created = await createHome([
        { name: 'Living Room', type: 'living_room', size: 'medium' },
      ]);
      const room = created.rooms[0]!;
      await addAppliances(created.homeId, room.roomId, [
        {
          name: 'TV',
          type: 'entertainment',
          wattage: 150,
          dailyUsageHours: 4,
          standbyWattage: 1,
          usageHabit: '',
        },
      ]);

      const home = await getHome(created.homeId);

      expect(home).not.toBeNull();
      expect(home!.rooms[0]!.appliances).toHaveLength(1);
      expect(home!.rooms[0]!.appliances[0]!.name).toBe('TV');
    });
  });

  describe('addAppliances', () => {
    it('throws HomeNotFoundError when the home does not exist', async () => {
      await expect(
        addAppliances('missing', 'missing', [])
      ).rejects.toBeInstanceOf(HomeNotFoundError);
    });

    it('throws RoomNotFoundError when the room does not exist', async () => {
      const home = await createHome([
        { name: 'Living Room', type: 'living_room', size: 'medium' },
      ]);

      await expect(
        addAppliances(home.homeId, 'missing-room', [
          {
            name: 'TV',
            type: 'entertainment',
            wattage: 150,
            dailyUsageHours: 4,
            standbyWattage: 0,
            usageHabit: '',
          },
        ])
      ).rejects.toBeInstanceOf(RoomNotFoundError);
    });

    it('computes monthlyKwh from wattage and daily hours', async () => {
      const home = await createHome([
        { name: 'Bedroom', type: 'bedroom', size: 'medium' },
      ]);
      const room = home.rooms[0]!;

      const [appliance] = await addAppliances(home.homeId, room.roomId, [
        {
          name: 'Fan',
          type: 'cooling',
          wattage: 100,
          dailyUsageHours: 10,
          standbyWattage: 0,
          usageHabit: '',
        },
      ]);

      // (100W/1000) * 10h * 30 days = 30 kWh (size factor = 1 for medium)
      expect(appliance!.monthlyKwh).toBe(30);
    });
  });

  describe('updateAppliance', () => {
    it('throws ApplianceNotFoundError when the appliance does not exist', async () => {
      const home = await createHome([
        { name: 'Room', type: 'bedroom', size: 'small' },
      ]);
      await expect(
        updateAppliance(home.homeId, 'missing', { wattage: 200 })
      ).rejects.toBeInstanceOf(ApplianceNotFoundError);
    });

    it('recomputes monthlyKwh after a wattage change', async () => {
      const home = await createHome([
        { name: 'Bedroom', type: 'bedroom', size: 'medium' },
      ]);
      const room = home.rooms[0]!;
      const [appliance] = await addAppliances(home.homeId, room.roomId, [
        {
          name: 'Fan',
          type: 'cooling',
          wattage: 100,
          dailyUsageHours: 10,
          standbyWattage: 0,
          usageHabit: '',
        },
      ]);

      const updated = await updateAppliance(home.homeId, appliance!.applianceId, {
        wattage: 200,
      });

      expect(updated.wattage).toBe(200);
      expect(updated.monthlyKwh).toBeCloseTo(60);
    });
  });

  describe('deleteAppliance', () => {
    it('removes the appliance from the home', async () => {
      const home = await createHome([
        { name: 'Room', type: 'bedroom', size: 'small' },
      ]);
      const room = home.rooms[0]!;
      const [appliance] = await addAppliances(home.homeId, room.roomId, [
        {
          name: 'Fan',
          type: 'cooling',
          wattage: 100,
          dailyUsageHours: 5,
          standbyWattage: 0,
          usageHabit: '',
        },
      ]);

      await deleteAppliance(home.homeId, appliance!.applianceId);

      const refreshed = await getHome(home.homeId);
      expect(refreshed!.rooms[0]!.appliances).toHaveLength(0);
    });
  });

  describe('rooms CRUD', () => {
    it('adds a room and returns it with an empty appliances list', async () => {
      const home = await createHome([
        { name: 'Room A', type: 'bedroom', size: 'small' },
      ]);

      const room = await addRoom(home.homeId, {
        name: 'Kitchen',
        type: 'kitchen',
        size: 'medium',
      });

      expect(room.roomId).toBeDefined();
      expect(room.appliances).toEqual([]);
    });

    it('updates an existing room', async () => {
      const home = await createHome([
        { name: 'Room A', type: 'bedroom', size: 'small' },
      ]);
      const room = home.rooms[0]!;

      const updated = await updateRoom(home.homeId, room.roomId, {
        name: 'Master Bedroom',
        size: 'large',
      });

      expect(updated.name).toBe('Master Bedroom');
      expect(updated.size).toBe('large');
    });

    it('deletes a room and its appliances', async () => {
      const home = await createHome([
        { name: 'Room A', type: 'bedroom', size: 'small' },
      ]);
      const room = home.rooms[0]!;
      await addAppliances(home.homeId, room.roomId, [
        {
          name: 'Fan',
          type: 'cooling',
          wattage: 100,
          dailyUsageHours: 5,
          standbyWattage: 0,
          usageHabit: '',
        },
      ]);

      await deleteRoom(home.homeId, room.roomId);

      const refreshed = await getHome(home.homeId);
      expect(refreshed!.rooms).toHaveLength(0);
    });
  });
});
