from utils.Preprocessing.orchestator import beginPreprocessing

import datetime


if __name__ == "__main__":
    start = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[start] " + str(start) + "\033[0m" + "\n")
    
    beginPreprocessing()
    
    end = datetime.datetime.now()
    print("\n" + "\033[0;34m" + "[end] "+ str(end) + "\033[0m" + "\n")
    print(f"Total Execution Time: {(end - start).total_seconds():.2f} seconds")