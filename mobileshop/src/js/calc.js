App = {
    web3Provider: null,
    contracts: {},

    init: function(brand) {

        $.getJSON( "http://fascrv.com/mobile_shop/read.php?token=a232b1fdd7dfc6fb67f3c2ed4789e6d5", function( data ) {
            var product = '';

            var prev_drop_down = $(".js_brand_wise_search").html();
            var drop_down = '';


            for(var i = 0; i < data.products.length; i++)
            {
                var stock_text = 'Stock Available';
                var stock_class = '';

                if(data.products[i].stock == 0)
                {
                    stock_text = 'Out of stock';
                    stock_class = 'un_stock';
                }

                if(brand)
                {

                    if($.isNumeric(brand) && data.products[i].id == brand)
                    {
                        product+= '<div class="product">'+
                            '<article> <img class="img-responsive" src="http://fascrv.com/mobile_shop/'+data.products[i].image+'" alt="" > <label id="sale-tag'+data.products[i].id+'" class="sale-tag '+stock_class+'">'+stock_text+' (<span id="stock'+data.products[i].id+'">'+data.products[i].stock+'</span>)</label>'+
                            '<a href="#." class="tittle">'+data.products[i].product_name+'</a>'+
                            '<p class="rev"><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i> <i class="fa fa-star"></i> <span class="margin-left-10">5 Review(s)</span></p>'+
                            '<div class="price">BDT '+data.products[i].price+'</div>'+
                            '<a href="#." data-id="'+data.products[i].id+'" class="cart-btn btn-calc">Buy</a> </article></div>';

                    }else{
                        if(data.products[i].brand == brand)
                        {
                            product+= '<div class="product">'+
                                '<article> <img class="img-responsive" src="http://fascrv.com/mobile_shop/'+data.products[i].image+'" alt="" > <label id="sale-tag'+data.products[i].id+'" class="sale-tag '+stock_class+'">'+stock_text+' (<span id="stock'+data.products[i].id+'">'+data.products[i].stock+'</span>)</label>'+
                                '<a href="#." class="tittle">'+data.products[i].product_name+'</a>'+
                                '<p class="rev"><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i> <i class="fa fa-star"></i> <span class="margin-left-10">5 Review(s)</span></p>'+
                                '<div class="price">BDT '+data.products[i].price+'</div>'+
                                '<a href="#." data-id="'+data.products[i].id+'" class="cart-btn btn-calc">Buy</a> </article></div>';

                            drop_down+= '<option id="op'+data.products[i].id+'" value="'+data.products[i].id+'">'+data.products[i].product_name+'</option>';
                        }
                    }

                }else{
                    product+= '<div class="product">'+
                        '<article> <img class="img-responsive" src="http://fascrv.com/mobile_shop/'+data.products[i].image+'" alt="" > <label id="sale-tag'+data.products[i].id+'" class="sale-tag '+stock_class+'">'+stock_text+' (<span id="stock'+data.products[i].id+'">'+data.products[i].stock+'</span>)</label>'+
                        '<a href="#." class="tittle">'+data.products[i].product_name+'</a>'+
                        '<p class="rev"><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i><i class="fa fa-star"></i> <i class="fa fa-star"></i> <span class="margin-left-10">5 Review(s)</span></p>'+
                        '<div class="price">BDT '+data.products[i].price+'</div>'+
                        '<a href="#." data-id="'+data.products[i].id+'" class="cart-btn btn-calc">Buy</a> </article></div>';

                    drop_down+= '<option id="op'+data.products[i].id+'" value="'+data.products[i].id+'">'+data.products[i].product_name+'</option>';
                }
            }

            if(!drop_down)
            {
                drop_down = prev_drop_down;
            }

            $(".js_product_list").html(product);
            $(".js_brand_wise_search").html(drop_down);

            if($.isNumeric(brand))
            {
                $("#op"+brand).attr("selected","selected");
            }
        });


        return App.initWeb3();
    },

    initWeb3: function() {
        // Initialize web3 and set the provider to the testRPC.
        if (typeof web3 !== 'undefined') {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // set the provider you want from Web3.providers
            App.web3Provider = new web3.providers.HttpProvider('http://localhost:8545');
            web3 = new Web3(App.web3Provider);
        }

        return App.initContract();
    },

    initContract: function() {
        $.getJSON('Calculator.json', function(data) {
            // Get the necessary contract artifact file and instantiate it with truffle-contract.
            var CalcArtifact = data;
            //App.contracts.Adoption = TruffleContract(AdoptionArtifact);
            App.contracts.Calculator = TruffleContract(CalcArtifact);

            // Set the provider for our contract.
            App.contracts.Calculator.setProvider(App.web3Provider);

            // Use our contract to retieve and mark the adopted pets.
            //return App.markAdopted();
        });

        return App.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '.btn-calc', App.handleCalc);
    },

    handleCalc: function() {

        var calculator;

        var p_id = parseInt($(event.target).data('id'));
        var stock =  $('#stock'+p_id).text();

        return App.contracts.Calculator.deployed().then(function(instance) {
            calculator = instance;
            return calculator.getResult.call();

        }).then(function(result) {

            calculator.subtractFromNumber(1);

            var r_stock = stock - 1;

            if(r_stock == 0)
            {
                $("#sale-tag"+p_id).addClass('un_stock');
                $("#sale-tag"+p_id).text('Out of stock');

            }


            //http://fascrv.com/mobile_shop/read.php?token=a232b1fdd7dfc6fb67f3c2ed4789e6d5

            $.ajax({
                type : "POST"
                ,url : "http://fascrv.com/mobile_shop/function.php"
                ,data : { stock : r_stock, pid:p_id  }
                ,dataType : "json"
                ,success: function(data) {

                    console.log(data);
                }
                ,error: function(e)
                {

                }
            });

            $('#stock'+p_id).text(r_stock);


        }).catch(function(err) {

            alert("Error Calculating value");
        });

    },

    handleAdopt: function() {
        event.preventDefault();

        var petId = parseInt($(event.target).data('id'));

        var adoptionInstance;

        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }

            var account = accounts[0];

            App.contracts.Adoption.deployed().then(function(instance) {
                adoptionInstance = instance;

                // Execute adopt as a transaction by sending account
                return adoptionInstance.adopt(petId, {from: account});
            }).then(function(result) {
                return App.markAdopted();
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    },

    markAdopted: function(adopters, account) {

    }

};

$(function() {



    $(window).load(function() {
        App.init();
    });


    $(document).ready(function () {
        $(".js_brand").click(function () {
            var brand = $(this).data('id');

            App.init(brand);
        });

        $(".js_search").click(function () {
            var brand = $(".filter-option").text();
            //var brand_wise_search = $(".js_brand_wise_search").val();

            if(brand == 'All')
            {
                brand = '';
            }

            App.init(brand.toLowerCase());
        });


        $(".js_brand_wise_search").change(function () {

            var id = $(this).val();

            App.init(id);
        });

    });
});