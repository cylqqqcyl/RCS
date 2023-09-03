import time
from Astar import Astar
from flask_socketio import SocketIO, emit

status_dict = {0: '在线', 1: '离线', 2: '异常', 3: '排除', 4: '维修'}

forklift1_status = {'id':1300, 'status': '在线', 'mission': '无', 'EXEstatus': '待分配', 'battery': 100, 'x': 250-55, 'y': 250-47, 'angle': 180}
forklift2_status = {'id':1301, 'status': '在线', 'mission': '无', 'EXEstatus': '待分配', 'battery': 100, 'x': 250-55, 'y': 250+2*300+160+47, 'angle': 180}
forklift3_status = {'id':1302, 'status': '在线', 'mission': '无', 'EXEstatus': '待分配', 'battery': 100, 'x': 250+8*150+40+55, 'y': 250+2*300+160+47, 'angle': 0}
forklift4_status = {'id':1303, 'status': '在线', 'mission': '无', 'EXEstatus': '待分配', 'battery': 100, 'x': 250+8*150+40+55, 'y': 250-47, 'angle': 0}

class Scheduler:
    def __init__(self, socket):
        self.socket = socket
        # 设备状态
        self.device_status = {
            1300: forklift1_status,
            1301: forklift2_status,
            1302: forklift3_status,
            1303: forklift4_status
        }
        # 队列存储任务
        self.tasks = []

    def distance(self, device, task):
        # 计算设备和任务之间的曼哈顿距离
        dx = abs(device['x'] - task['x'])
        dy = abs(device['y'] - task['y'])
        return dx + dy

    def add_task(self, task):  # 添加任务 must be a list
        self.tasks.extend(task)

    def get_status(self):
        return list(self.device_status.values())

    def get_free_devices(self):
        return [device for device in self.get_status() if device['mission'] == '无']
    def assign_task(self):
        # 找到所有空闲的设备
        free_devices = self.get_free_devices()
        for device in free_devices:
            # 找到距离设备最近的任务
            if not self.tasks:
                break
            closest_task = min(self.tasks, key=lambda task: self.distance(device, task))
            print('设备{}分配任务{}'.format(device['id'], closest_task['id']))
            # 将任务分配给设备
            device['mission'] = closest_task['id']

            # 计算路径
            self.plan_path(device, closest_task)

            # 更新设备状态
            device['EXEstatus'] = '任务执行中'

            # 从任务队列中移除已分配的任务
            self.tasks.remove(closest_task)

    def auto_reassign_task(self, device_id, task):
        # 找到所有空闲的设备
        free_devices = self.get_free_devices()
        closest_device = min(free_devices, key=lambda device: self.distance(device, task))
        print('设备{}分配任务{}'.format(closest_device['id'], task['id']))
        # 将任务分配给设备
        self.manual_reassign_task(device_id, task, closest_device['id'])
        return closest_device['id']

    def manual_reassign_task(self, device_id, task, target_device_id):
        self.manual_assign_task(target_device_id, task)
        self.device_status[device_id]['mission'] = '无'
        self.device_status[device_id]['EXEstatus'] = '任务{}已被分配给设备{}'.format(task['id'], target_device_id)

    def manual_assign_task(self, device_id, task):
        device = self.device_status[device_id]
        print('设备{}分配任务{}'.format(device['id'], task['id']))
        # 将任务分配给设备
        device['mission'] = task['id']
        # 计算路径
        self.plan_path(device, task)
        # 更新设备状态
        device['EXEstatus'] = '任务执行中'


    def plan_path(self, forklift, path_goal):
        astar = Astar()
        nearest_node = astar.find_nearest_node(forklift)
        came_from, cost_so_far = astar.a_star_search(nearest_node, path_goal)
        path_points = [{'x': forklift['x'], 'y': forklift['y']}]  # 叉车可能不在节点上，所以先把叉车的位置加进去
        path_points.extend(astar.reconstruct_path(came_from, nearest_node, path_goal))
        print(path_points)
        self.socket.emit('pathPoints', {'data': path_points, 'forkliftId': forklift['id']})

    def start_assign(self):
        while True:
            if self.tasks:
                self.assign_task()
            time.sleep(1)
