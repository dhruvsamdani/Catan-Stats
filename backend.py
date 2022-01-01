import psycopg2 as pc2
from configparser import ConfigParser

class Database():
    def __init__(self, filename, section):
        self.filename = filename
        self.section = section

    def config(self):
        parser = ConfigParser()
        parser.read(self.filename)
        db_info = {}

        if parser.has_section(self.section):
            for key, value in parser.items(self.section):
                db_info[key] = value
        return db_info

    def addToDatabase(self, entry_data):
        params = self.config()
        conn = pc2.connect(**params)
        cursor = conn.cursor()
        cursor.execute('INSERT INTO games (two, three, four, five, six, seven, eight, nine, ten, eleven, twelve, winner, player_size) '
                        'VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)', entry_data)
        conn.commit()
        cursor.close()
        conn.close()


