import classes.parking_inventory as PI
import sys
if __name__=="__main__":
    #print(sys.argv)
    lot_a_analyser = int(sys.argv[1])
    print(f'Lot à analyser: {lot_a_analyser}')
    inventaire_lot = PI.calculate_inventory_by_lot(lot_a_analyser)