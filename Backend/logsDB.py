import sqlite3

logs_example = [{'id': 1, 'level': 'INFO','createdAt': '2020-01-01 11:11:11', 'content': 'This is an info log'},
                {'id': 2, 'level': 'INFO','createdAt': '2020-01-01 11:11:12', 'content': 'This is an info log'},
                {'id': 3, 'level': 'INFO','createdAt': '2020-01-01 11:11:13', 'content': 'This is an info log'},
                {'id': 4, 'level': 'WARNING','createdAt': '2020-01-01 11:11:14', 'content': 'This is a warning log'},
                {'id': 5, 'level': 'ERROR','createdAt': '2020-01-01 11:11:15', 'content': 'This is an error log'},
                {'id': 6, 'level': 'INFO','createdAt': '2020-01-01 11:11:16', 'content': 'This is an info log'},
                {'id': 7, 'level': 'INFO','createdAt': '2020-01-01 11:11:17', 'content': 'This is an info log'},
                {'id': 8, 'level': 'INFO','createdAt': '2020-01-01 11:11:18', 'content': 'This is an info log'},
                {'id': 9, 'level': 'INFO','createdAt': '2020-01-01 11:11:19', 'content': 'This is an info log'},
                {'id': 10, 'level': 'INFO','createdAt': '2020-01-01 11:11:20', 'content': 'This is an info log'},
                {'id': 11, 'level': 'INFO','createdAt': '2020-01-01 11:11:21', 'content': 'This is an info log'},
                ]

level_weights = {"ERROR": 3, "WARNING": 2, "INFO": 1}

class LogsDB:
    def __init__(self):
        self.db_name = 'logs.db'
        self.check_table()

    def check_table(self):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        # cursor.execute('''DROP TABLE IF EXISTS logs''')
        cursor.execute('''CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level TEXT,
            levelWeight INTEGER,
            createdAt DATETIME,
            content TEXT
        )''')
        conn.commit()
        conn.close()

    def get_sorted_logs(self, page=1, order_by="createdAt", desc=True, limit=10):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        if order_by=="level":
            order_by = "levelWeight"
        order_direction = "DESC" if desc else "ASC"
        offset = (int(page) - 1) * limit  # Calculate the offset based on the page number and limit
        cursor.execute(
            f'SELECT id, level, createdAt, content FROM logs ORDER BY {order_by} {order_direction} LIMIT {limit} OFFSET {offset}')
        rows = cursor.fetchall()
        conn.close()
        return [dict(zip([column[0] for column in cursor.description], row)) for row in rows]

    def get_page_count(self, limit=10):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        cursor.execute(f'SELECT COUNT(*) FROM logs')
        count = cursor.fetchone()[0]
        conn.close()
        return count // limit + 1

    def insert_logs(self, logs):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        for log in logs:
            log['levelWeight'] = level_weights[log['level']]
            cursor.execute('INSERT INTO logs (level, levelWeight, createdAt, content) VALUES (:level, :levelWeight, :createdAt, :content)', log)
        conn.commit()
        conn.close()

    def insert_log(self, log):
        conn = sqlite3.connect(self.db_name)
        cursor = conn.cursor()
        log['levelWeight'] = level_weights[log['level']]
        cursor.execute('INSERT INTO logs (level, levelWeight, createdAt, content) VALUES (:level, :levelWeight, :createdAt, :content)', log)
        conn.commit()
        conn.close()

if __name__ == '__main__':
    db = LogsDB()
    print(db.get_sorted_logs())
    # print(db.insert_log(logs_example))
    print(db.get_page_count())
