import heapq
import json
import matplotlib.pyplot as plt
import ast

class PriorityQueueNode:
    def __init__(self, priority, node):
        self.priority = priority
        self.node = node

    def __lt__(self, other):
        return self.priority < other.priority
def heuristic(a, b):
    return abs(b['x'] - a['x']) + abs(b['y'] - a['y'])

class Astar:
    def __init__(self):
        with open('graph.json', 'r') as f:
            graph = json.load(f)
        self.graph = graph  # 注意key是字符串格式存储的字典，需要eval()转换为字典

    def find_nearest_node(self, forklift):  # 理想状态，叉车的坐标与节点的坐标的x或y坐标相等
        x, y = forklift['x'], forklift['y']
        nearest_node = None
        min_distance = float('inf')
        nodes = list(self.graph.keys())
        for node in nodes:
            node = eval(node)
            node_x, node_y = node['x'], node['y']
            # 如果叉车的x坐标与节点的x坐标相等
            if x == node_x:
                distance = abs(node_y - y)
                if distance < min_distance:
                    min_distance = distance
                    nearest_node = node
            # 如果叉车的y坐标与节点的y坐标相等
            elif y == node_y:
                distance = abs(node_x - x)
                if distance < min_distance:
                    min_distance = distance
                    nearest_node = node

        self.start = nearest_node
        return nearest_node

    def a_star_search(self, start, goal):  # A*算法
        frontier = []
        heapq.heappush(frontier, PriorityQueueNode(0, start))
        came_from = {}
        cost_so_far = {}
        came_from[str(start)] = None
        cost_so_far[str(start)] = 0  # 从起点到当前点的代价，同时相当于记录了当前点是否被访问过

        while frontier:
            current = heapq.heappop(frontier).node

            if current == goal:
                break

            for next in self.graph[str(current)]:  # 遍历当前点的邻接点
                next = eval(next)
                new_cost = cost_so_far[str(current)] + heuristic(current, next)
                if str(next) not in cost_so_far or new_cost < cost_so_far[str(next)]:  # 如果邻接点没有被访问过或者新的代价更小
                    cost_so_far[str(next)] = new_cost
                    priority = new_cost + heuristic(goal, next)
                    heapq.heappush(frontier, PriorityQueueNode(priority, next))
                    came_from[str(next)] = current  # 记录当前点的父节点

        return came_from, cost_so_far

    def reconstruct_path(self, came_from, start, goal):
        current = {'x': goal['x'], 'y': goal['y']}
        path = []
        while current != start:
            path.append(current)
            current = came_from[str(current)]
        path.append(start)  # optional
        path.reverse()  # optional
        return path

    def plot_map(self):
        for key, value in self.graph.items():
            point = [eval(key)['x'], eval(key)['y']]
            plt.plot(point[0], point[1], 'ro')
            for neighbor in value:
                neighbor_point = [eval(neighbor)['x'], eval(neighbor)['y']]
                plt.plot([point[0], neighbor_point[0]], [point[1], neighbor_point[1]], 'b')


def main():
    # 将起点和终点从列表转换为字典
    start = {'x': 195, 'y': 203}
    goal = {'x': 1545, 'y': 1057}

    astar = Astar()
    # 进行A*搜索
    came_from, cost_so_far = astar.a_star_search(start, goal)

    print(list(astar.graph.keys()))
    astar.plot_map()
    path = astar.reconstruct_path(came_from, start, goal)

    # 将路径从字典列表转换为坐标列表
    path_coords = [(node['x'], node['y']) for node in path]
    plt.plot([start['x']], [start['y']], 'go')
    plt.plot([goal['x']], [goal['y']], 'co')
    # 解析路径坐标
    x_coords, y_coords = zip(*path_coords)

    # 绘制图像
    plt.plot(x_coords, y_coords, 'y-')
    plt.show()
    # print(graph)

if __name__ == '__main__':
    main()
