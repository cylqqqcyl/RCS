# app.py
import random
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import threading
import time
import math
from scheduler import Scheduler
from logsDB import LogsDB
from datetime import datetime

app = Flask(__name__)
CORS(app, origins="http://localhost:3000")
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")

scheduler = Scheduler(socketio)
logsDB = LogsDB()

device_status = scheduler.get_status()

path_goal = {'x': 0, 'y': 0}


def unit2goal(unit):
    row = int(unit[1]) - 1
    column = int(unit[2]) - 1
    subrow = int(unit[3]) - 1
    subcolumn = int(unit[4]) - 1

    unitX = 250 + 150 * column + 20 * subcolumn
    unitY = 250 + 300 * row + 20 * subrow

    if unit[-1] == '1':
        path_goal = {'id': unit, 'x': unitX, 'y': unitY + 10}
    elif unit[-1] == '2':
        path_goal = {'id': unit, 'x': unitX + 20, 'y': unitY + 10}
    else:
        raise Exception('Invalid unit id')
    return path_goal


def send_heartbeat():  # Send a heartbeat to the front end
    while True:
        socketio.emit('heartbeat', {'data': 'heartbeat'})
        time.sleep(5)  # Wait for 5 seconds before the next heartbeat


def update_device_status():  # Update the status of the device
    while True:
        # 更新设备状态
        for device in device_status:
            device['battery'] = random.randint(0, 100)  # 随机更新电量

        # 将新的设备状态发送到前端
        socketio.emit('deviceStatus', device_status)

        # 每5秒更新一次
        time.sleep(5)


def forklift_movement():
    global forklift
    path = [(250 - 55, 250 - 47),
            (250 - 55, 250 + 2 * 300 + 160 + 47),
            (250 + 8 * 150 + 40 + 55, 250 + 2 * 300 + 160 + 47),
            (250 + 8 * 150 + 40 + 55, 250 - 47)]  # Define the path for the forklift
    speed = 10  # Define the speed of the forklift
    rotation_speed = 10  # Define the rotation speed of the forklift
    while True:
        for start, end in zip(path, path[1:] + path[:1]):  # Loop through the path
            dx, dy = end[0] - start[0], end[1] - start[1]  # Calculate the change in x and y
            distance = math.hypot(dx, dy)  # Calculate the distance
            steps = int(distance / speed)  # Calculate the number of steps
            for i in range(steps):
                t = i / steps  # Calculate the normalized step
                forklift['x'] = int(start[0] + t * dx)  # Update the x position
                forklift['y'] = int(start[1] + t * dy)  # Update the y position
                socketio.emit('forklift', forklift)  # Send the updated forklift data to the front end
                time.sleep(0.5)  # Wait for a while before the next update
            forklift['x'] = end[0]  # Update the x position
            forklift['y'] = end[1]  # Update the y position
            socketio.emit('forklift', forklift)  # Send the updated forklift data to the front end
            time.sleep(0.5)  # Wait for a while before the next update
            # Add a 90` rotation at the end of each path segment

            target_angle = (forklift['angle'] - 90) % 360  # Calculate the target angle
            angle_diff = (target_angle - forklift[
                'angle']) % 360  # the difference between target angle and current angle
            if angle_diff > 180:  # If the angle difference is greater than 180
                angle_diff -= 360  # Subtract 360 from the angle difference
            direction = 1 if angle_diff > 0 else -1  # Determine the direction of rotation
            while abs(angle_diff) > 0:  # Loop until the angle difference is less than or equal to 0
                if abs(angle_diff) < rotation_speed:
                    forklift['angle'] += direction * angle_diff  # Update the angle
                    forklift['angle'] %= 360  # Ensure the angle is between 0 and 360
                else:
                    forklift['angle'] += direction * rotation_speed  # Update the angle
                    forklift['angle'] %= 360  # Ensure the angle is between 0 and 360
                    angle_diff -= direction * rotation_speed  # Update the angle difference
                socketio.emit('forklift', forklift)  # Send the updated forklift data to the front end
                time.sleep(0.5)  # Wait for a while before the next update


@socketio.on('connect')
def handle_connect():
    # When a client connects, send the initial position of the forklift
    emit('deviceStatus', device_status)
    # path_points = [{'x': 100, 'y': 200}, {'x': 300, 'y': 400}, {'x': 500, 'y': 600}]
    # emit('sendPath', path_points)


@socketio.on('update')
def handle_update(data):
    # When the position of the forklift is updated, send the new position
    emit('deviceStatus', data)


@socketio.on('selectedUnits')
def handle_selected_units(data):
    # global forklift
    print(data)
    path_goals = []

    for unit in data:
        path_goal = unit2goal(unit)
        path_goals.append(path_goal)
    print(path_goals)
    scheduler.add_task(path_goals)


@app.route('/logs', methods=['GET'])
def get_logs():
    page = request.args.get('page')
    sort_field = request.args.get('sortField')
    sort_order = request.args.get('sortOrder')

    if sort_order == 'asc':
        logs = logsDB.get_sorted_logs(page=page, order_by=sort_field, desc=False)
    else:
        logs = logsDB.get_sorted_logs(page=page, order_by=sort_field, desc=True)

    page_count = logsDB.get_page_count()
    return jsonify({'logs': logs, 'pageCount': page_count})  # Return a dictionary with 'logs' and 'pageCount'


@app.route('/devices/<action>', methods=['POST', 'OPTIONS'])
def handle_device_action(action):
    print(action)
    print(request.method)
    if request.method == 'POST':
        if action == 'continueDevice':
            result = "处理成功"
            response = jsonify({'message': result})
            return response, 200
        elif action == 'pauseDevice':
            result = "处理成功"  # 这只是一个示例，你需要根据你的逻辑来设置这个值
            response = jsonify({'message': result})
            return response, 200
        # 添加更多的 elif 语句来处理其他的 action
        else:
            return 'Unknown action', 400
    else:
        return '', 204


@app.route('/devices', methods=['GET'])
def get_free_devices():
    devices = scheduler.get_free_devices()
    return jsonify({'devices': devices})


@app.route('/devices/changeConfirm', methods=['POST', 'OPTIONS'])
def confirm_change():
    print(request.method)
    if request.method == 'POST':
        if request.json['selectedDevice'] == 'autoChange':
            target_device = scheduler.auto_reassign_task(request.json['deviceId'],
                                                         unit2goal(request.json['deviceMission']))
            result = "换车自动分配成功"
            response = jsonify({'message': result})
            logsDB.insert_log({'level': 'INFO', 'createdAt': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                               'content': '设备{}换车自动分配成功,任务{}分配给设备{}'.format(request.json['deviceId'],
                                                                            request.json['deviceMission'],
                                                                            target_device)})
            return response, 200
        else:
            scheduler.manual_reassign_task(request.json['deviceId'], unit2goal(request.json['deviceMission']),
                                           request.json['selectedDevice'])
            result = "换车分配成功"
            response = jsonify({'message': result})
            logsDB.insert_log({'level': 'INFO', 'createdAt': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                               'content': '设备{}换车分配成功,任务{}分配给设备{}'.format(request.json['deviceId'],
                                                                            request.json['deviceMission'],
                                                                            request.json['selectedDevice'])})
            return response, 200
    else:
        return '', 204


if __name__ == '__main__':
    # movement_thread = threading.Thread(target=forklift_movement)
    # movement_thread.start()  # Start the forklift movement thread
    heartbeat_thread = threading.Thread(target=send_heartbeat)
    heartbeat_thread.start()  # Start the heartbeat thread
    device_status_thread = threading.Thread(target=update_device_status)
    device_status_thread.start()  # Start the device status thread
    scheduler_thread = threading.Thread(target=scheduler.start_assign)
    scheduler_thread.start()  # Start the scheduler thread
    socketio.run(app, host='0.0.0.0', port=8080, allow_unsafe_werkzeug=True, debug=True)  # Start the socket server
