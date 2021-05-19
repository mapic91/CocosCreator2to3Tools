import json
import re
import os


def find_file_with_ext(rootpath, ext):
    return find_file_reg(rootpath, r".*\." + ext + "$", re.IGNORECASE)


def find_file_reg(rootpath, filename_pattern, flag):
    """
    find file use regular expression
    :param flag:
    :param rootpath:
    :param filename_pattern:
    :return:
    """
    out = []
    for (dirpath, dirnames, filenames) in os.walk(rootpath):
        for filename in filenames:
            if re.match(filename_pattern, filename, flag):
                out.append(os.path.join(dirpath, filename))
    return out


if __name__ == '__main__':
    files = find_file_with_ext(r"D:\marketclt\trunk\jingying_trunk_3\assets\resources\cdnRes", "prefab")
    for file in files:
        with open(file, "rb") as f:
            content = f.read().decode("UTF-8")
        obj = json.loads(content)
        changed = False
        for d in obj:
            if d.get("__type__") is not None and d.get("__type__") == "e4f88adp3hERoJ48DZ2PSAl":
                if d.get("_font") is None or d.get("_font").get("__uuid__") != "803c185c-9442-4b99-af1a-682f877539ab":
                    d["_font"] = {"__uuid__": "803c185c-9442-4b99-af1a-682f877539ab"}
                    changed = True
            if d.get("_fontSize") is not None and d.get("_lineHeight") is not None:
                if d.get("_fontSize") > d.get("_lineHeight"):
                    d["_lineHeight"] = d["_fontSize"] + 1
                    changed = True
        if changed:
            with open(file, "w") as f:
                json.dump(obj, f, ensure_ascii=True)


# See PyCharm help at https://www.jetbrains.com/help/pycharm/
