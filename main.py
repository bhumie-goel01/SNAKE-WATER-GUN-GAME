# SNAKE WATER GUN GAME CODE 

# random module helps to generate random numbers (-1,0,1) for computer's choice
import random  
'''
snake = 0
water = 1
gun -1
'''
# Intro of the game
print ("\n---LET'S PLAY SNAKE WATER GUN:---\n")
print ('''For SNAKE enter S/s
For WATER enter W/w
For GUN enter G/g\n ''')

user_score = 0
computer_score = 0
draw_score = 0

# To keep the game running until the user wants to exit, use a while loop
while (True):

    computer = random.choice((-1,0,1))
    your_choice = input("\nEnter your choice:").lower()  # Convert user input to lowercase

    # to convert user input to corresponding number
    youdict = {"s" : 0, "w" : 1, "g":-1}  

    # Check if the user input is valid or not
    if ( your_choice not in youdict):
        print("Invalid input, try again!")
        continue # skip the rest of the loop and ask for input again
    else:
        # Convert user input to corresponding number
        you = youdict[your_choice]
        
        # to print the full name corresponding to the number
        name_dict = {0:"Snake", 1:"Water", -1:"Gun"}

        # Print the choices of both the user and the computer
        print (f"Your choice: {name_dict[you]}")
        print (f"Computer's choice: {name_dict[computer]}\n")

        if (you == computer):
            print ("It's a draw!")
            draw_score += 1
        elif (computer == 0 and you == 1):
            print ("You lose!")
            computer_score += 1
        elif (computer == 0 and you == -1):
            print ("You win!")
            user_score += 1
        elif (computer == 1 and you == -1):
            print ("You lose!")
            computer_score += 1
        elif (computer == 1 and you == 0):
            print ("You win!")
            user_score += 1
        elif (computer == -1 and you == 1):
            print ("You win!")
            user_score += 1
        elif (computer == -1 and you == 0):
            print ("You lose!")
            computer_score += 1
    print ("\nGood Play! Let's play again!\n")   

    print (f"Your score: {user_score}") 
    print (f"Computer's score: {computer_score}")
    print (f"Draws: {draw_score}")

    while (True):
        # Ask the user if they want to play again
        again = input("\nDO YOU WANT TO PLAY AGAIN (Y/N): ").lower()
        if (again == "y" or again == "n"):
            break
        else:
            print("Invalid input, please enter Y or N.")

    # If the user inputs 'n', break the loop and exit the game
    if (again == "n"):
        if (user_score > computer_score):
            print ("\nCongratulations! You won the game!!\n")
        elif (computer_score > user_score):
            print ("\nSorry, you lost the game. Better luck next time!\n")
        else:
            print ("\nIt's a tie! Well played!\n")
        break

print ("Well played! See you next time!!\n")  

# End of the game