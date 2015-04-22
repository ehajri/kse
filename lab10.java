import java.util.Scanner;

public class lab10
{
	public static void main(String[] args)
	{
	    Scanner in = new Scanner(System.in);
	    
	    System.out.println("Enter a line of text");
	    String msg = in.nextLine();
	    
	    int length = msg.length();
	    
	    int spaces = 0;
	    int small_letter = 0;
	    int capital_letter = 0;

	    for (int i = 0; i < length; i++)
	    {
	        if (msg.charAt(i) == ' ')
	        {
	            spaces = spaces + 1;
	        }
	        if (Character.isLowerCase(msg.charAt(i))) {
	            small_letter = small_letter + 1;
	        }
	        if (Character.isUpperCase(msg.charAt(i))) {
	            capital_letter = capital_letter + 1;
	        }
	    }
	    
	    System.out.println("you typed " + spaces + " spaces and " + small_letter + " small letters and " + capital_letter + " capital letters.");
	}
}





















