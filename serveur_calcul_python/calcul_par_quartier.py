import classes.parking_inventory as PI
import sys
if __name__=="__main__":
    print(sys.argv)
    quartier_a_analyser = int(sys.argv[1])
    PI.calculate_inventory_by_analysis_sector(quartier_a_analyser)