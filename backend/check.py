import sqlite3
conn = sqlite3.connect('webcrm.db')
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
print('Jadvallar:', cur.fetchall())
conn.close()