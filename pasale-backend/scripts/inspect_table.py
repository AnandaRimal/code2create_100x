import os
from sqlalchemy import create_engine, text

def inspect_table(table_name='rewards'):
    url=os.environ.get('DATABASE_URL', 'mysql+pymysql://root:root@localhost:3306/pasale_db')
    print('Using DB URL:', url)
    engine=create_engine(url)
    with engine.connect() as conn:
        query = text("SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=:tbl")
        res=conn.execute(query, {'tbl': table_name})
        rows=res.fetchall()
        if not rows:
            print(f"No columns found for table '{table_name}' (table may not exist)")
        for r in rows:
            print(r)

if __name__ == '__main__':
    import sys
    tbl = sys.argv[1] if len(sys.argv) > 1 else 'rewards'
    inspect_table(tbl)
