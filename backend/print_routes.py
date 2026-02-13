from app.main import app
import urllib.parse

def print_routes():
    output = []
    for rule in app.url_map.iter_rules():

        options = {}
        for arg in rule.arguments:
            options[arg] = "[{0}]".format(arg)

        methods = ','.join(rule.methods)
        url = urllib.parse.unquote("{:50s} {}".format(str(rule), methods))
        output.append(url)
    
    with open("routes.txt", "w") as f:
        for line in sorted(output):
            f.write(line + "\n")
            print(line)

if __name__ == "__main__":
    print_routes()
