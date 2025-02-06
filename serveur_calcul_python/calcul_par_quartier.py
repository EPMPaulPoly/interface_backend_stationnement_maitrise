import classes.parking_inventory as PI
import sys
if __name__=="__main__":
    print(sys.argv)
    PI.calculate_inventory_by_analysis_sector(int(sys.argv[1]))