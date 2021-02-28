from distutils.dir_util import copy_tree
import os
import sys
import string
import shutil

if os.path.exists('../extension'):
    shutil.rmtree('../extension')
    os.remove('../extension.zip')
    print('Cleaning old stuff')

os.makedirs('../extension')
copy_tree('../YourAutoLiker', '../extension')

print('Copying the extension folder')

shutil.rmtree('../extension/docs')
os.remove('../extension/sendExtension.py')
print('Removing website folder')


def inplace_change(filename, old_string, new_string):
    # Safely read the input filename using 'with'
    with open(filename) as f:
        s = f.read()
        if old_string not in s:
            print('No ocurrences on {filename}.'.format(**locals()))
            return

    # Safely write the changed content, if found in the file
    with open(filename, 'w') as f:
        print(
            'Replaced in {filename}'.format(**locals()))
        s = s.replace(old_string, new_string)
        f.write(s)


for root, dirs, files in os.walk("../extension"):
    for file in files:
        if file.endswith(".js"):
            inplace_change(os.path.join(root, file),
                           'console.log', '//console.log')

shutil.make_archive('../extension', 'zip', '../extension')
print('creating zip file')
