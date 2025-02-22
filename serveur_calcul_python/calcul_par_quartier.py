import classes.parking_inventory as PI
import sys
if __name__=="__main__":
    #print(sys.argv)
    quartier_a_analyser = int(sys.argv[1])
    print(f'Quartier à analyser: {quartier_a_analyser}')
    #PI.calculate_inventory_by_analysis_sector(quartier_a_analyser)